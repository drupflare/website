import { existsSync, readFileSync } from 'node:fs';

/** where the scheduled certification job publishes the status file */
export const STATUS_URL = 'https://cdn.drupflare.com/certified/status.json';

/** what the status file says about one fixture; `none` means no run at the pinned commit passed */
export type StatusEntry = {
	state: 'certified' | 'deployed' | 'none';
	sha: string;
	plan: string;
	date: string;
	at: string;
	source: 'manual' | 'scheduled';
	expires: string;
	streak: number;
	anachron?: string;
	failing: string[];
};

/** the published status file */
export type StatusFile = {
	generated: string;
	intervalDays: number;
	fixtures: Record<string, StatusEntry>;
};

/** a fixture's certification as the snapshot keeps it */
export type Certification = Omit<StatusEntry, 'state'> & {
	state: 'certified' | 'deployed';
	intervalDays: number;
};

/** the parts of a fixture row the certification step reads and writes */
export type FixtureRow = {
	id: string;
	sha: string;
	state: string;
	total: number;
	deployedDate: string | null;
	certification?: Certification | null;
};

/** the parts of a module row the headline counts read */
export type ModuleRow = { state: string; runsIn: string[] };

/** a snapshot as `fixtures.json` holds it */
export type Snapshot = { modules: ModuleRow[]; fixtures: FixtureRow[] };

const isStatus = (v: unknown): v is StatusFile => {
	const s = v as StatusFile | null;
	return (
		typeof s === 'object' &&
		s !== null &&
		typeof s.intervalDays === 'number' &&
		typeof s.fixtures === 'object' &&
		s.fixtures !== null
	);
};

/**
 * Reads the certification status from a local file when one is named, otherwise from the CDN.
 * Returns null when neither answers, so the caller keeps what the snapshot already holds.
 */
export async function loadStatus(opts: {
	file?: string | undefined;
	fetcher?: typeof fetch;
	timeoutMs?: number;
	warn?: (message: string) => void;
}): Promise<{ status: StatusFile | null; from: string }> {
	const warn = opts.warn ?? console.warn;
	if (opts.file) {
		if (!existsSync(opts.file)) throw new Error(`status file ${opts.file} does not exist`);
		const parsed: unknown = JSON.parse(readFileSync(opts.file, 'utf8'));
		if (!isStatus(parsed)) throw new Error(`status file ${opts.file} is not a status file`);
		return { status: parsed, from: opts.file };
	}
	try {
		const res = await (opts.fetcher ?? fetch)(STATUS_URL, {
			signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000)
		});
		if (!res.ok) throw new Error(`answered ${res.status}`);
		const parsed: unknown = await res.json();
		if (!isStatus(parsed)) throw new Error('the body is not a status file');
		return { status: parsed, from: STATUS_URL };
	} catch (e) {
		warn(
			`certification status not read from ${STATUS_URL} (${(e as Error).message}); keeping the snapshot's`
		);
		return { status: null, from: 'snapshot' };
	}
}

/**
 * Sets each fixture's certification from the status. A fixture is certified only when the status
 * lists it as certified at its pinned commit. With no status the snapshot's blocks stand.
 */
export function applyCertification<T extends FixtureRow>(
	fixtures: T[],
	status: StatusFile | null,
	previous: ReadonlyMap<string, Certification | null | undefined>
): T[] {
	return fixtures.map((f) => {
		let certification: Certification | null;
		if (status === null) {
			certification = previous.get(f.id) ?? null;
		} else {
			const e = status.fixtures[f.id];
			certification =
				e && e.state !== 'none' && e.sha.slice(0, 10) === f.sha.slice(0, 10)
					? { ...e, state: e.state, intervalDays: status.intervalDays }
					: null;
		}
		const row = { ...f, certification };
		if (certification?.state === 'certified') {
			return { ...row, state: 'certified', deployedDate: f.deployedDate ?? certification.date };
		}
		if (certification?.state === 'deployed') {
			return { ...row, state: 'deployed', deployedDate: f.deployedDate ?? certification.date };
		}
		return row;
	});
}

/** the counts a headline quotes; each is cumulative so a fixture moving up never lowers one */
export function headline(s: Snapshot) {
	const n = (states: string[]) => s.fixtures.filter((f) => states.includes(f.state)).length;
	return {
		fixtures: s.fixtures.length,
		ran: s.fixtures.filter((f) => (f.total > 0 && f.state !== 'pending') || f.certification).length,
		verifiedOrBetter: n(['verified', 'deployed', 'certified']),
		deployedOrBetter: n(['deployed', 'certified']),
		certified: n(['certified']),
		modules: s.modules.length,
		verifiedModules: s.modules.filter((m) => m.state === 'verified').length,
		testedModules: s.modules.filter(
			(m) => m.state === 'verified' || m.state === 'tested' || m.runsIn.length > 0
		).length
	};
}

const ranOf = (f: FixtureRow) => (f.total > 0 && f.state !== 'pending') || !!f.certification;

/** every headline count that would fall from `before` to `after`, and every fixture that stops counting as run */
export function drops(before: Snapshot, after: Snapshot): string[] {
	const b = headline(before);
	const a = headline(after);
	const next = new Map(after.fixtures.map((f) => [f.id, f]));
	const lost = before.fixtures
		.filter((f) => ranOf(f) && next.has(f.id) && !ranOf(next.get(f.id)!))
		.map((f) => `fixture ${f.id}: ran -> not run (${f.state} -> ${next.get(f.id)!.state})`);
	return [
		...(Object.keys(b) as (keyof typeof b)[])
			.filter((k) => a[k] < b[k])
			.map((k) => `${k}: ${b[k]} -> ${a[k]}`),
		...lost
	];
}
