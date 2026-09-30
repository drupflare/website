import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * Snapshots the worker's module census, fixture corpus and lane results into `src/data/fixtures.json`.
 *
 *   bun run sync:fixtures                 # reads ../worker
 *   WORKER_DIR=/path/to/worker bun run sync:fixtures
 *
 * The site is static and built without the worker checked out, so the snapshot is committed and this
 * script is rerun whenever the worker's census or lane results move. Nothing here infers a state: a
 * module is verified only when its census entry says how, and a fixture row carries only what a lane
 * recorded.
 */

const ROOT = resolve(import.meta.dirname, '..');
const WORKER = resolve(process.env.WORKER_DIR ?? join(ROOT, '..', 'worker'));
const OUT = join(ROOT, 'src', 'data', 'fixtures.json');

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

const modules = Object.entries(census.modules)
	.map(([pkg, m]) => ({
		name: pkg.replace(/^drupal\//, ''),
		package: pkg,
		state: m.verified ? 'verified' : 'untested',
		verified: m.verified ? sentence(m.verified) : null,
		shipping: m.shipping ?? false,
		custom: false,
		link: `https://www.drupal.org/project/${pkg.replace(/^drupal\//, '')}`,
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
const fixtures = (corpus?.repos ?? []).map((r) => {
	const run = results?.repos[r.id];
	// a result for an older commit describes a different codebase, so it does not count
	const entries = run && run.sha === r.sha ? Object.entries(run.rows) : [];
	const recorded = entries.map(([, row]) => row);
	const rows = recorded.map((row) => row.state);
	// the lane records a core that does not accept Drupal 11 as unsupported on every row, naming it
	const upgrade =
		recorded.length > 0 && recorded.every((row) => row.note?.startsWith('needs upgrade:'));
	// the lane's first version refused a profile distribution outright, so no capability ran on Drupflare
	const notRun =
		recorded.length > 0 &&
		recorded.every((row) =>
			/^(?:blocked by install: )?(?:install profile \S+ needs a fresh Drupal install|native install of profile)/.test(
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
		state:
			rows.length === 0 || notRun
				? 'pending'
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
const byPackage = new Map<string, Module>(modules.map((m) => [m.package, m]));
const ranIn = (key: string, fixture: string, make: () => Module) => {
	const m = byPackage.get(key) ?? make();
	byPackage.set(key, m);
	if (!m.runsIn.includes(fixture)) m.runsIn.push(fixture);
};
for (const f of fixtures.filter((x) => x.state === 'verified' || x.state === 'deployed')) {
	const run = results?.repos[f.id];
	const enabled = new Set(run?.enabled ?? []);
	for (const m of modules) if (enabled.has(m.name)) ranIn(m.package, f.name, () => m);
	for (const pkg of run?.packages ?? []) {
		const short = pkg.startsWith('drupal/') ? pkg.slice('drupal/'.length) : null;
		ranIn(pkg, f.name, () => ({
			name: short ?? pkg,
			package: pkg,
			state: 'tested',
			verified: null,
			shipping: false,
			custom: false,
			link:
				short === null
					? `https://packagist.org/packages/${pkg}`
					: `https://www.drupal.org/project/${short}`,
			runsIn: []
		}));
	}
	for (const name of run?.custom ?? []) {
		ranIn(`${f.name}:${name}`, f.name, () => ({
			name: `${f.name.split('/')[0]}/${name}`,
			package: `${f.name}:${name}`,
			state: 'tested',
			verified: null,
			shipping: false,
			custom: true,
			link: f.repo,
			runsIn: []
		}));
	}
}
modules.splice(
	0,
	modules.length,
	...[...byPackage.values()].sort((a, b) => a.name.localeCompare(b.name))
);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
	OUT,
	JSON.stringify(
		{ generated: new Date().toISOString().slice(0, 10), modules, fixtures },
		null,
		'\t'
	) + '\n'
);
console.log(
	`${modules.filter((m) => m.state === 'verified').length} verified modules, ${fixtures.length} fixtures ` +
		`(${fixtures.filter((f) => f.state === 'verified' || f.state === 'deployed').length} verified) -> ${OUT}`
);
