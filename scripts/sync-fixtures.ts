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
type Corpus = { repos: { id: string; repo: string; sha: string; shape: string; core: string }[] };
type Results = {
	repos: Record<
		string,
		{ sha: string; date: string; run: string; rows: Record<string, { state: string }> }
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
		shipping: m.shipping ?? false
	}))
	.sort((a, b) => a.name.localeCompare(b.name));

const passing = new Set(['inline', 'parked', 'degraded']);
const fixtures = (corpus?.repos ?? []).map((r) => {
	const run = results?.repos[r.id];
	// a result for an older commit describes a different codebase, so it does not count
	const rows = run && run.sha === r.sha ? Object.values(run.rows).map((row) => row.state) : [];
	const count = (states: string[]) => rows.filter((s) => states.includes(s)).length;
	return {
		id: r.id,
		repo: r.repo,
		name: r.repo.replace('https://github.com/', ''),
		sha: r.sha,
		shape: r.shape,
		core: r.core,
		date: rows.length ? run!.date : null,
		passed: count([...passing]),
		degraded: count(['degraded']),
		unsupported: count(['unsupported']),
		unknown: count(['unknown']),
		total: rows.length,
		state:
			rows.length === 0 ? 'pending' : rows.every((s) => passing.has(s)) ? 'verified' : 'partial'
	};
});

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
		`(${fixtures.filter((f) => f.state === 'verified').length} verified) -> ${OUT}`
);
