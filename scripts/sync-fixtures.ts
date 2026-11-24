import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { applyCertification, drops, headline, loadStatus, type Snapshot } from './fixtures-lib';

/**
 * Snapshots the worker's module census, fixture corpus and lane results into `src/data/fixtures.json`.
 *
 *   bun run sync:fixtures                 # reads ../worker
 *   WORKER_DIR=/path/to/worker bun run sync:fixtures
 *   bun run sync:fixtures --status=status.json   # or CERT_STATUS_FILE; else the CDN, else the snapshot's
 *
 * The site is static and built without the worker checked out, so the snapshot is committed and this
 * script is rerun whenever the worker's census or lane results move. Nothing here infers a state: a
 * module is verified only when its census entry says how, and a fixture row carries only what a lane
 * recorded.
 */

const ROOT = resolve(import.meta.dirname, '..');
const WORKER = resolve(process.env.WORKER_DIR ?? join(ROOT, '..', 'worker'));
const argOf = (flag: string) =>
	process.argv.find((a) => a.startsWith(`--${flag}=`))?.slice(flag.length + 3);
const OUT = argOf('out') ?? join(ROOT, 'src', 'data', 'fixtures.json');
const COMMITTED = join(ROOT, 'src', 'data', 'fixtures.json');

type Census = { modules: Record<string, { why?: string; verified?: string; shipping?: boolean }> };
type Corpus = {
	repos: {
		id: string;
		repo: string;
		sha: string;
		shape: string;
		core: string;
		credential?: string;
	}[];
};
type Results = {
	repos: Record<
		string,
		{
			sha: string;
			date: string;
			run: string;
			rows: Record<string, { state: string; note?: string }>;
			enabled?: string[];
			/** the same rows driven against a deployed Worker, kept beside the local run */
			deployed?: {
				sha: string;
				date: string;
				plan: string;
				rows: Record<string, { state: string; note?: string }>;
			};
			/** composer packages of a Drupal type the lane delivered, any vendor */
			packages?: string[];
			/** the repository's own modules, themes and profiles */
			custom?: string[];
		}
	>;
};

const read = <T>(path: string): T | null =>
	existsSync(path) ? (Bun.YAML.parse(readFileSync(path, 'utf8')) as T) : null;

// the census notes are repo prose; the site shows them as sentences
const sentence = (note: string) => {
	const t = note.replace(/\s+/g, ' ').trim();
	return t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? '' : '.');
};

const census = read<Census>(join(WORKER, 'config', 'modules.yml'));
if (!census) throw new Error(`no module census at ${WORKER}/config/modules.yml`);
const corpus = read<Corpus>(join(WORKER, 'config', 'corpus.yml'));
const resultsPath = join(WORKER, 'docs', 'compatibility.json');
const results: Results | null = existsSync(resultsPath)
	? JSON.parse(readFileSync(resultsPath, 'utf8'))
	: null;
// the same corpus run with anachron loaded, kept apart so the verified record is not touched
const anachronPath = join(WORKER, 'docs', 'compatibility-anachron.json');
const anachronResults: Results | null = existsSync(anachronPath)
	? JSON.parse(readFileSync(anachronPath, 'utf8'))
	: null;

// a drupal.org project is keyed by its machine name whether a lane wrote drupal/foo or foo
const projectKey = (name: string) => name.replace(/^drupal\//, '');

const modules = Object.entries(census.modules)
	.map(([pkg, m]) => ({
		name: projectKey(pkg),
		package: pkg,
		cms: 'drupal',
		state: m.verified ? 'verified' : 'untested',
		verified: m.verified ? sentence(m.verified) : null,
		shipping: m.shipping ?? false,
		custom: false,
		anachron: false,
		link: `https://www.drupal.org/project/${projectKey(pkg)}`,
		// the Verified codebases whose finished site enabled it, filled in below
		runsIn: [] as string[]
	}))
	.sort((a, b) => a.name.localeCompare(b.name));

const passing = new Set(['inline', 'parked', 'degraded']);

// the lane's wording for the causes a reader meets most, restated for someone outside the project
const PLAIN: [RegExp, (m: RegExpMatchArray) => string][] = [
	[
		/^install profile (\S+) needs a fresh Drupal install/,
		(m) =>
			`Built as the ${m[1]} install profile. A Drupflare site starts from the standard profile, so this arrives as a migration from a native install, and that migration has not completed yet`
	],
	[
		/^needs upgrade: core (\S+) does not accept Drupal 11/,
		(m) => `Its core requirement (${m[1]}) does not allow Drupal 11`
	],
	[
		/^enabling (\S+) was refused: Unable to install modules \S+ due to missing modules (\S+?)\./,
		(m) => `Enabling ${m[1]} needs the module ${m[2]}, which is not on the registry`
	],
	[
		/^enabling (\S+) was refused: Class "[^"]*?(\w+)" does not exist/,
		(m) =>
			`Enabling ${m[1]} failed: its routing file names a class, ${m[2]}, that the module does not ship`
	],
	[
		/^installing (\S+) dev-main from the registry failed/,
		(m) => `Needs ${m[1]} at dev-main, which is only in a git repository, not on the registry`
	],
	[
		/^updb ended in phase halted: cold-interpreter/,
		() => 'The database update chain waited for a warm interpreter and halted'
	],
	[/^not a site: (.*)/, (m) => `Not a site: ${m[1]}`],
	[
		/^migrated: .*?(\d+)\/(\d+) registry packages.*?\d+ failed: (.*?)(?:; \d+ rows written|$)/,
		(m) => {
			const names = [...m[3]!.matchAll(/(?:^|\| )([\w-]+\/[\w-]+)/g)].map((n) => n[1]);
			return `Migrated from a native install; ${m[1]} of ${m[2]} registry packages installed, not ${names.join(', ')}`;
		}
	],
	[
		/^native install of project (\S+)/,
		(m) =>
			`The ${m[1]} project's own installer failed in the test rig, before anything reached Drupflare`
	],
	[
		/^native install of profile (\S+)/,
		(m) =>
			`The ${m[1]} distribution's own installer failed in the test rig, before anything reached Drupflare`
	],
	[
		/openy_features \S+ from the registry failed: drupal\/address: no version of drupal\/address matches \^1\.8/,
		() => "Open Y's openy_features 5.2 requires drupal/address ^1.8, which has no Drupal 11 release"
	]
];

// a lane note carries page markup and JSON after its first clause; a tooltip wants the clause
const reason = (note = '') => {
	const flat = note
		.replace(/\s+/g, ' ')
		.replace(/^blocked by install: /, '')
		.trim();
	for (const [re, say] of PLAIN) {
		const m = flat.match(re);
		if (m) return say(m);
	}
	const t = note
		.replace(/\s+/g, ' ')
		.split(/[;|{]/)[0]!
		.replace(/^blocked by install: /, '')
		.trim();
	return t.length > 140 ? `${t.slice(0, 137)}...` : t;
};

// capabilities that failed, grouped by the reason the lane gave, so a shared cause reads once
const missingOf = (rows: [string, { state: string; note?: string }][]) => {
	const groups = new Map<string, string[]>();
	for (const [cap, row] of rows) {
		if (passing.has(row.state)) continue;
		const key = reason(row.note) || row.state;
		groups.set(key, [...(groups.get(key) ?? []), cap]);
	}
	return [...groups].map(([why, caps]) => ({ caps, reason: why }));
};
// every run that tried a codebase on its pinned commit, whatever it found, with the arm it ran on
type Run = NonNullable<Results['repos'][string]>;
const tried: { id: string; run: Run; arm: 'main' | 'anachron' }[] = [];
const fixtures = (corpus?.repos ?? []).map((r) => {
	const base = results?.repos[r.id];
	// a result for an older commit describes a different codebase, so it does not count
	const own = base && base.sha === r.sha ? Object.entries(base.rows) : [];
	// the lane records a core that does not accept Drupal 11 as unsupported on every row, naming it
	const refusedCore =
		own.length > 0 && own.every(([, row]) => row.note?.startsWith('needs upgrade:'));
	// such a codebase is judged by its anachron run when one exists for the same commit
	const withAnachron = anachronResults?.repos[r.id];
	const viaAnachron =
		refusedCore &&
		withAnachron !== undefined &&
		withAnachron.sha === r.sha &&
		Object.keys(withAnachron.rows).length > 0;
	const run = viaAnachron ? withAnachron : base;
	const entries = viaAnachron ? Object.entries(withAnachron.rows) : own;
	const recorded = entries.map(([, row]) => row);
	const rows = recorded.map((row) => row.state);
	const upgrade = refusedCore && !viaAnachron;
	if (run && entries.length > 0 && !upgrade) {
		tried.push({ id: r.id, run, arm: viaAnachron ? 'anachron' : 'main' });
	}
	// a codebase judged on its own run can also have an anachron run at the same commit
	if (
		!viaAnachron &&
		withAnachron &&
		withAnachron.sha === r.sha &&
		Object.keys(withAnachron.rows).length > 0
	) {
		tried.push({ id: r.id, run: withAnachron, arm: 'anachron' });
	}
	// a run that enabled none of the codebase's modules describes the base site, not the codebase
	const baseOnly = viaAnachron && /\b0\/0 modules enabled/.test(run?.rows['install']?.note ?? '');
	// the lane's first version refused a profile distribution outright, so no capability ran on Drupflare
	const notRun =
		recorded.length > 0 &&
		recorded.every((row) =>
			/^(?:blocked by install: )?(?:install profile \S+ needs a fresh Drupal install|native install of (?:profile|project))/.test(
				row.note ?? ''
			)
		);
	const count = (states: string[]) => rows.filter((s) => states.includes(s)).length;
	const deployedRun = run?.deployed && run.deployed.sha === r.sha ? run.deployed : null;
	const deployed =
		deployedRun !== null &&
		Object.keys(deployedRun.rows).length === 13 &&
		Object.values(deployedRun.rows).every((row) => passing.has(row.state));
	return {
		id: r.id,
		repo: r.repo,
		name: r.repo.replace('https://github.com/', ''),
		sha: r.sha,
		shape: r.shape,
		core: r.core,
		credential: r.credential ?? null,
		date: rows.length ? run!.date : null,
		passed: count([...passing]),
		degraded: count(['degraded']),
		unsupported: count(['unsupported']),
		unknown: count(['unknown']),
		total: rows.length,
		tested: entries.filter(([, row]) => passing.has(row.state)).map(([cap]) => cap),
		missing: missingOf(entries),
		deployedDate: deployed ? deployedRun!.date : null,
		deployedPlan: deployed ? deployedRun!.plan : null,
		anachron: viaAnachron,
		baseOnly,
		blockedCause: notRun
			? (recorded[0]?.note ?? '').replace(/^blocked by install: /, '').slice(0, 300)
			: null,
		state:
			rows.length === 0
				? 'pending'
				: notRun
					? 'blocked'
					: upgrade
						? 'needs-upgrade'
						: rows.every((s) => passing.has(s))
							? deployed
								? 'deployed'
								: 'verified'
							: 'partial'
	};
});

// evidence that a module runs in a real codebase, which is not the module's own enable-and-assert
// verification, so it is shown beside the state rather than changing it. A package or custom module
// outside the census is listed as tested: it ran, and nothing asserted it on its own
type Module = (typeof modules)[number];
const byKey = new Map<string, Module>(
	modules.map((m) => [m.package.startsWith('drupal/') ? projectKey(m.package) : m.package, m])
);
// the arms each entry ran on; a module is anachron-only when it never ran on the main arm
const arms = new Map<string, Set<string>>();
const ranIn = (key: string, fixture: string, arm: string, make: () => Module) => {
	const m = byKey.get(key) ?? make();
	byKey.set(key, m);
	arms.set(key, (arms.get(key) ?? new Set()).add(arm));
	if (!m.runsIn.includes(fixture)) m.runsIn.push(fixture);
};
const tested = (name: string, pkg: string, link: string, custom = false): Module => ({
	name,
	package: pkg,
	cms: 'drupal',
	state: 'tested',
	verified: null,
	shipping: false,
	custom,
	anachron: false,
	link,
	runsIn: []
});
// a codebase the lanes tried credits its modules whether or not it worked
for (const { id, run, arm } of tried) {
	const f = fixtures.find((x) => x.id === id)!;
	const customNames = new Set(run.custom ?? []);
	for (const name of run.enabled ?? []) {
		// an enabled module that the repository ships is the custom entry, not a drupal.org project
		if (customNames.has(name)) continue;
		const key = projectKey(name).toLowerCase();
		ranIn(key, f.name, arm, () =>
			tested(key, `drupal/${key}`, `https://www.drupal.org/project/${key}`)
		);
	}
	for (const pkg of run.packages ?? []) {
		const short = pkg.startsWith('drupal/') ? projectKey(pkg).toLowerCase() : null;
		ranIn(short ?? pkg, f.name, arm, () =>
			tested(
				short ?? pkg,
				pkg,
				short === null
					? `https://packagist.org/packages/${pkg}`
					: `https://www.drupal.org/project/${short}`
			)
		);
	}
	for (const name of customNames) {
		ranIn(`${f.name}:${name}`, f.name, arm, () =>
			tested(`${f.name.split('/')[0]}/${name}`, `${f.name}:${name}`, f.repo, true)
		);
	}
}
for (const [key, m] of byKey) {
	m.anachron =
		m.state !== 'verified' &&
		arms.get(key)?.has('anachron') === true &&
		!arms.get(key)?.has('main');
}
modules.splice(
	0,
	modules.length,
	...[...byKey.values()].sort((a, b) => a.name.localeCompare(b.name))
);

// #region certification
const previous: Snapshot | null = existsSync(COMMITTED)
	? JSON.parse(readFileSync(COMMITTED, 'utf8'))
	: null;
const { status, from } = await loadStatus({
	file: argOf('status') ?? process.env.CERT_STATUS_FILE
});
const certified = applyCertification(
	fixtures,
	status,
	new Map((previous?.fixtures ?? []).map((f) => [f.id, f.certification]))
);
// #endregion

const next = { generated: new Date().toISOString().slice(0, 10), modules, fixtures: certified };
const fell = previous ? drops(previous, next) : [];
if (fell.length) {
	console.error(`a headline count would fall:\n  ${fell.join('\n  ')}`);
	if (OUT === COMMITTED) {
		console.error(`refusing to write ${OUT}`);
		process.exit(1);
	}
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(next, null, '\t') + '\n');
const h = headline(next);
console.log(
	`${h.verifiedModules} verified modules of ${h.modules}, ${h.fixtures} fixtures ` +
		`(${h.verifiedOrBetter} verified, ${h.deployedOrBetter} deployed, ${h.certified} certified; ` +
		`status from ${from}) -> ${OUT}`
);
