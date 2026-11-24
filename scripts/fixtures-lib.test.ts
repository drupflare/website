import { describe, expect, test } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	applyCertification,
	drops,
	loadStatus,
	type Certification,
	type FixtureRow,
	type StatusEntry,
	type StatusFile
} from './fixtures-lib';

const entry = (over: Partial<StatusEntry> = {}): StatusEntry => ({
	state: 'certified',
	sha: 'aaaaaaaaaaaaaaaa',
	plan: 'paid',
	date: '2026-11-24',
	at: '2026-11-24T03:47:21.639Z',
	source: 'manual',
	expires: '2026-12-08',
	streak: 3,
	failing: [],
	...over
});
const file = (fixtures: Record<string, StatusEntry>): StatusFile => ({
	generated: '2026-11-24',
	intervalDays: 4,
	fixtures
});
const fixture = (over: Partial<FixtureRow> = {}): FixtureRow => ({
	id: 'a',
	sha: 'aaaaaaaaaaaaaaaa',
	state: 'verified',
	total: 13,
	deployedDate: null,
	...over
});
const kept: Certification = { ...entry(), state: 'certified', intervalDays: 4 };
const cdnOf = (body: unknown, ok = true) =>
	(async () => new Response(JSON.stringify(body), { status: ok ? 200 : 404 })) as typeof fetch;
const writeStatus = (s: StatusFile) => {
	const path = join(mkdtempSync(join(tmpdir(), 'status-')), 'status.json');
	writeFileSync(path, JSON.stringify(s));
	return path;
};

describe('loadStatus', () => {
	test('a named file wins and the CDN is never asked', async () => {
		let asked = false;
		const fetcher = (async () => {
			asked = true;
			return new Response('{}');
		}) as typeof fetch;
		const path = writeStatus(file({ a: entry() }));
		const { status, from } = await loadStatus({ file: path, fetcher });
		expect(asked).toBe(false);
		expect(from).toBe(path);
		expect(status?.fixtures.a?.state).toBe('certified');
	});

	test('the CDN is read when no file is named', async () => {
		const { status } = await loadStatus({ fetcher: cdnOf(file({ a: entry() })) });
		expect(status?.fixtures.a?.state).toBe('certified');
	});

	test('a CDN failure returns no status and warns', async () => {
		const warnings: string[] = [];
		const { status, from } = await loadStatus({
			fetcher: cdnOf({}, false),
			warn: (m) => warnings.push(m)
		});
		expect(status).toBeNull();
		expect(from).toBe('snapshot');
		expect(warnings[0]).toContain('answered 404');
	});

	test('a network error is a failure too', async () => {
		const fetcher = (async () => {
			throw new Error('offline');
		}) as typeof fetch;
		const { status } = await loadStatus({ fetcher, warn: () => {} });
		expect(status).toBeNull();
	});

	test('a named file that is missing is an error, not a fallback', async () => {
		await expect(loadStatus({ file: '/nonexistent/status.json' })).rejects.toThrow(
			'does not exist'
		);
	});
});

describe('applyCertification', () => {
	test('a CDN failure keeps the snapshot certified state', () => {
		const [f] = applyCertification([fixture({ state: 'certified' })], null, new Map([['a', kept]]));
		expect(f?.state).toBe('certified');
		expect(f?.certification).toEqual(kept);
	});

	test('the status file certifies a fixture and carries its interval and expiry', () => {
		const [f] = applyCertification([fixture()], file({ a: entry() }), new Map());
		expect(f?.state).toBe('certified');
		expect(f?.certification?.intervalDays).toBe(4);
		expect(f?.certification?.expires).toBe('2026-12-08');
	});

	test('a fixture missing from the status is never certified, whatever the snapshot held', () => {
		const [f] = applyCertification(
			[fixture({ state: 'certified' })],
			file({ other: entry() }),
			new Map([['a', kept]])
		);
		expect(f?.certification).toBeNull();
		expect(f?.state).toBe('certified');
	});

	test('an entry for another commit is not evidence for the pin', () => {
		const [f] = applyCertification(
			[fixture()],
			file({ a: entry({ sha: 'bbbbbbbbbbbbbbbb' }) }),
			new Map()
		);
		expect(f?.certification).toBeNull();
		expect(f?.state).toBe('verified');
	});

	test('a deployed entry makes the fixture deployed and never certified', () => {
		const [f] = applyCertification(
			[fixture()],
			file({ a: entry({ state: 'deployed' }) }),
			new Map()
		);
		expect(f?.state).toBe('deployed');
		expect(f?.deployedDate).toBe('2026-11-24');
	});
});

describe('drops', () => {
	const snap = (fixtures: FixtureRow[], modules = 3) => ({
		modules: Array.from({ length: modules }, () => ({ state: 'tested', runsIn: [] })),
		fixtures
	});

	test('a fixture moving up is not a drop', () => {
		const before = snap([fixture()]);
		const after = snap([fixture({ state: 'certified' })]);
		expect(drops(before, after)).toEqual([]);
	});

	test('a falling module count is refused', () => {
		expect(drops(snap([fixture()], 5), snap([fixture()], 4))).toContain('modules: 5 -> 4');
	});

	test('a fixture that stops counting as run is refused', () => {
		const lost = drops(snap([fixture()]), snap([fixture({ state: 'pending', total: 0 })]));
		expect(lost.some((l) => l.startsWith('fixture a: ran -> not run'))).toBe(true);
		expect(lost.some((l) => l.startsWith('verifiedOrBetter'))).toBe(true);
	});
});
