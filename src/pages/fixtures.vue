<template>
	<div
		v-if="page"
		class="mx-auto max-w-4xl px-4 sm:px-6"
	>
		<header class="pt-16 pb-6 text-center sm:pt-20 sm:text-left">
			<h1 class="rise text-highlighted text-4xl font-black tracking-tight sm:text-6xl">
				{{ page.headline }}
			</h1>
			<p
				class="rise text-muted mt-5 text-lg leading-relaxed"
				style="animation-delay: 100ms"
			>
				{{ page.intro }}
			</p>
		</header>

		<ContentRenderer :value="page" />

		<section class="border-default mt-12 border-t pt-10">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-highlighted text-2xl font-black">🧩 Contrib Modules</h2>
				<UButton
					color="neutral"
					variant="ghost"
					size="lg"
					class="min-h-11"
					:aria-expanded="showModules"
					aria-controls="module-list"
					:trailing-icon="showModules ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
					:label="showModules ? 'Hide List' : 'Show List'"
					@click="showModules = !showModules"
				/>
			</div>
			<p class="text-muted mt-2 text-sm">
				<span class="text-highlighted font-semibold">{{ formatCount(testedModules) }}</span> modules
				tested, including {{ formatCount(testedContrib) }} contrib;
				{{ formatCount(verifiedModules) }} verified, {{ formatCount(untestedModules) }} untested.
				Tested means verified, or part of a codebase the lanes tried, whether or not it worked.
				{{ formatCount(anachronModules) }} ran only through anachron, the legacy backend behavior.
			</p>
			<div
				v-show="showModules"
				id="module-list"
			>
				<div class="mt-5 flex flex-col gap-3">
					<UInput
						v-model="query"
						icon="i-lucide-search"
						size="xl"
						placeholder="Search by name or package"
						aria-label="Search Modules"
						class="w-full"
					/>
					<div
						class="flex flex-wrap gap-2"
						role="group"
						aria-label="Filter Modules"
					>
						<UButton
							v-for="f in moduleFilters"
							:key="f.key"
							:color="filter === f.key ? 'primary' : 'neutral'"
							:variant="filter === f.key ? 'solid' : 'outline'"
							size="lg"
							class="min-h-11"
							:aria-pressed="filter === f.key"
							:label="`${f.label} ${formatCount(f.count)}`"
							@click="filter = f.key"
						/>
					</div>
					<p
						class="text-muted text-sm"
						aria-live="polite"
					>
						{{ formatCount(shownModules.length) }} of {{ formatCount(modules.length) }} modules
					</p>
				</div>
				<ul class="mt-3 grid items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
					<li
						v-for="m in shownModules"
						:key="m.package"
						class="min-w-0"
					>
						<details class="group border-default open:border-primary/50 rounded-lg border">
							<summary class="flex min-h-11 cursor-pointer list-none items-center gap-3 px-4 py-3">
								<span
									class="size-2.5 shrink-0 rounded-full"
									:class="stateDot[m.status]"
									aria-hidden="true"
								/>
								<span class="min-w-0 flex-1">
									<a
										:href="m.link"
										:title="m.name"
										target="_blank"
										rel="noopener noreferrer"
										class="text-highlighted block truncate font-mono text-sm font-medium underline-offset-4 hover:underline"
										@click.stop
										>{{ m.name }}</a
									>
									<span class="mt-1 flex flex-wrap items-center gap-1">
										<DrupalBadge v-if="m.cms === 'drupal'" />
										<AnachronBadge v-if="m.anachron" />
										<UBadge
											v-if="m.shipping"
											color="neutral"
											variant="subtle"
											size="sm"
											>Ships</UBadge
										>
										<UBadge
											v-if="m.custom"
											color="neutral"
											variant="subtle"
											size="sm"
											>Custom</UBadge
										>
										<UBadge
											v-if="m.runsIn.length"
											color="primary"
											variant="subtle"
											size="sm"
											>In {{ m.runsIn.length }}
											{{ m.runsIn.length === 1 ? 'Codebase' : 'Codebases' }}</UBadge
										>
									</span>
								</span>
								<span
									class="shrink-0 text-xs font-medium"
									:class="stateText[m.status]"
									>{{ stateLabel[m.status] }}</span
								>
								<UIcon
									name="i-lucide-chevron-down"
									class="text-dimmed size-4 shrink-0 transition group-open:rotate-180"
								/>
							</summary>
							<p class="text-muted px-4 pb-2 text-sm">
								<a
									:href="m.link"
									target="_blank"
									rel="noopener noreferrer"
									class="text-highlighted font-mono wrap-anywhere underline-offset-4 hover:underline"
									>{{ m.custom ? m.name : m.package }}</a
								>
								on {{ hostOf(m.link) }}
							</p>
							<p class="text-muted px-4 pb-4 text-sm leading-relaxed">
								<template v-if="m.verified">
									<template
										v-for="(part, i) in m.verified.split('`')"
										:key="i"
									>
										<code
											v-if="i % 2"
											class="bg-muted rounded px-1 font-mono text-xs wrap-anywhere"
											>{{ part }}</code
										>
										<template v-else>{{ part }}</template>
									</template>
								</template>
								<template v-else-if="m.status === 'tested'"
									>Part of a codebase the lanes tried, whether or not that codebase worked. It has
									no enable-and-assert run of its own.</template
								>
								<template v-else>No enable-and-assert run yet.</template>
								<template v-if="m.runsIn.length"> Tried in {{ m.runsIn.join(', ') }}.</template>
							</p>
						</details>
					</li>
				</ul>
				<p
					v-if="!shownModules.length"
					class="text-muted mt-6 text-center text-sm"
				>
					No modules match.
				</p>
			</div>
		</section>

		<section class="border-default mt-12 border-t pt-10">
			<div class="flex flex-wrap items-baseline justify-between gap-3">
				<h2 class="text-highlighted text-2xl font-black">🏛️ Production Codebases</h2>
				<p class="text-muted text-sm">
					<span class="text-primary font-semibold">{{ formatCount(verifiedFixtures) }}</span> of
					{{ formatCount(fixtures.length) }} verified<template v-if="deployedFixtures"
						>, {{ formatCount(deployedFixtures) }} of them deployed</template
					><template v-if="certifiedFixtures"
						>, {{ formatCount(certifiedFixtures) }} of them certified</template
					>, {{ formatCount(partialFixtures) }} partially verified,
					{{ ranFixtures === fixtures.length ? 'all ran' : `${formatCount(ranFixtures)} ran` }},
					snapshot
					{{ data.generated }}
				</p>
			</div>
			<div class="text-muted mt-3 max-w-3xl text-sm leading-relaxed">
				<p>
					Each codebase is scored on 13 capabilities. Verified means all 13 passed on the Drupflare
					runtime in a local <code>wrangler dev</code>; Deployed means they also passed against a
					Worker deployed to a Cloudflare account. A partial badge is red when it misses one on the
					critical path (install, container build, rendering, or form submit) and amber when every
					missing one is something a production site can still be viable without.
				</p>
			</div>
			<UButton
				color="neutral"
				variant="ghost"
				size="lg"
				class="mt-2 min-h-11"
				trailing-icon="i-lucide-arrow-up-right"
				label="Read More"
				@click="showMore = true"
			/>
			<UModal
				v-model:open="showMore"
				title="How Codebases Are Scored"
				description="Which missing capabilities matter, and how each codebase reaches the site."
				:ui="{ content: 'max-w-2xl' }"
			>
				<template #body>
					<div class="text-muted text-sm leading-relaxed">
						<p>
							Incompatible with editorial workloads, viable for a site that is not one. An editorial
							site is one where anyone creates, edits or deletes content through Drupal in
							production, however rarely; a site whose content only changes through a deploy
							(drangler, config or a migration) is not one.
						</p>
						<ul class="mt-1 list-disc space-y-1 pl-5">
							<li
								v-for="c in editorial"
								:key="c.key"
							>
								<span class="text-highlighted font-medium">{{ c.label }}</span
								>: {{ c.why }}
							</li>
						</ul>
						<p class="mt-3">Viable without on any site:</p>
						<ul class="mt-1 list-disc space-y-1 pl-5">
							<li
								v-for="c in optional"
								:key="c.key"
							>
								<span class="text-highlighted font-medium">{{ c.label }}</span
								>: {{ c.why }}
							</li>
						</ul>
					</div>
					<div class="text-muted mt-4 max-w-3xl text-sm leading-relaxed">
						<p>How each codebase reaches the site, on a local Drupflare worker:</p>
						<ul class="mt-1 list-disc space-y-1 pl-5">
							<li>
								<span class="text-highlighted font-medium">Modules and module suites</span>: the
								packages they require come from drupal.org or Packagist through the
								<code class="bg-muted rounded px-1 font-mono text-xs">/install</code> route that
								<code class="bg-muted rounded px-1 font-mono text-xs">drangler modify require</code>
								uses, the repository's own modules go up with
								<code class="bg-muted rounded px-1 font-mono text-xs">drangler modify upload</code>,
								and Drupal's installer turns them on.
							</li>
							<li>
								<span class="text-highlighted font-medium">Distributions and projects</span>:
								installed natively in Docker the way a server would run them (composer, then
								<code class="bg-muted rounded px-1 font-mono text-xs">drush site:install</code> with
								the project's own recipes or install options). The database moves in with
								<code class="bg-muted rounded px-1 font-mono text-xs">drangler migrate install</code
								>, the site is claimed, the packages in its lock file come from the registry, and
								the profile and custom code go up with
								<code class="bg-muted rounded px-1 font-mono text-xs">drangler modify upload</code>.
								This is the bring-your-own-site path in the
								<NuxtLink
									to="/how-to#bring-your-own-site"
									class="text-highlighted underline underline-offset-4"
									>How-To</NuxtLink
								>.
							</li>
							<li>
								<span class="text-highlighted font-medium">Legacy codebases</span>: a codebase
								written for Drupal 10 or earlier runs with anachron, the legacy compatibility layer,
								and its badge counts the capabilities that passed (Unsupported when none did). One
								that has not been run that way is labelled Needs Upgrade to 11 and is not driven.
							</li>
						</ul>
					</div>
				</template>
			</UModal>
			<div class="mt-5 flex flex-col gap-3">
				<UInput
					v-model="fixtureQuery"
					icon="i-lucide-search"
					size="xl"
					placeholder="Search by name, shape, core or commit"
					aria-label="Search Codebases"
					class="w-full"
				/>
				<div
					class="flex flex-wrap gap-2"
					role="group"
					aria-label="Filter Codebases"
				>
					<UButton
						v-for="f in fixtureFilters"
						:key="f.key"
						:color="fixtureFilter === f.key ? 'primary' : 'neutral'"
						:variant="fixtureFilter === f.key ? 'solid' : 'outline'"
						size="lg"
						class="min-h-11"
						:aria-pressed="fixtureFilter === f.key"
						:label="`${f.label} ${formatCount(f.count)}`"
						@click="fixtureFilter = f.key"
					/>
				</div>
				<p
					class="text-muted text-sm"
					aria-live="polite"
				>
					{{ formatCount(shownFixtures) }} of {{ formatCount(fixtures.length) }} codebases
				</p>
			</div>
			<div
				id="fixture-list"
				class="border-default mt-3 overflow-x-auto rounded-lg border"
			>
				<table class="w-full min-w-[40rem] text-sm">
					<thead class="bg-muted text-left">
						<tr>
							<th class="text-highlighted px-4 py-3 font-semibold">Codebase</th>
							<th class="text-highlighted px-4 py-3 font-semibold">Shape</th>
							<th class="text-highlighted px-4 py-3 font-semibold">Core</th>
							<th class="text-highlighted px-4 py-3 font-semibold">Commit</th>
							<th class="text-highlighted px-4 py-3 font-semibold">Status</th>
						</tr>
					</thead>
					<tbody class="divide-default divide-y">
						<template
							v-for="g in groups"
							:key="g.key"
						>
							<tr class="bg-muted">
								<th
									colspan="5"
									class="text-highlighted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase"
								>
									{{ g.label }}
									<span class="text-muted font-normal">{{ formatCount(g.rows.length) }}</span>
								</th>
							</tr>
							<tr
								v-for="f in g.rows"
								:key="f.id"
							>
								<td class="px-4 py-3">
									<a
										:href="f.repo"
										target="_blank"
										rel="noopener noreferrer"
										class="text-highlighted font-medium underline-offset-4 hover:underline"
										>{{ f.name }}</a
									>
								</td>
								<td class="text-muted px-4 py-3 capitalize">{{ f.shape }}</td>
								<td class="text-muted px-4 py-3 font-mono text-xs">{{ f.core }}</td>
								<td class="px-4 py-3">
									<a
										:href="`${f.repo}/commit/${f.sha}`"
										target="_blank"
										rel="noopener noreferrer"
										class="text-muted hover:text-primary font-mono text-xs"
										>{{ f.sha.slice(0, 8) }}</a
									>
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-wrap items-center gap-1.5">
										<UTooltip
											:disabled="
												f.tested.length + f.missing.length === 0 && !f.credential && !f.certified
											"
											:content="{ side: 'left' }"
											:ui="{ content: 'h-auto max-w-80 py-2' }"
										>
											<UBadge
												:color="statusColor(f)"
												variant="subtle"
												size="sm"
												tabindex="0"
												:leading-icon="f.certified ? 'i-lucide-award' : undefined"
												:ui="f.certified ? { base: 'bg-certified/10 text-certified' } : undefined"
												class="cursor-help"
												>{{ statusLabel(f) }}</UBadge
											>
											<template #content>
												<div class="space-y-1.5 text-xs leading-snug whitespace-normal">
													<p v-if="f.state === 'deployed'">
														Passed on a real Worker deployed to a Cloudflare account, after passing
														in a local <code>wrangler dev</code>.
													</p>
													<p v-else-if="f.state === 'verified'">
														Passed in a local <code>wrangler dev</code>. Not yet run on a deployed
														Worker.
													</p>
													<p v-if="f.certified">
														Certified. Three deployed runs in a row passed every capability on the
														pinned commit, on the {{ f.run?.plan }} plan. It holds while three of
														the newest four runs passed and the newest one did; with no passing run
														it expires on {{ f.run?.expires }}. Last run
														{{ formatRunTime(f.run?.at, f.run?.date ?? '')
														}}{{ runSource(f.run) ? `, ${runSource(f.run)}` : '' }}. Every fixture
														is rerun within {{ f.interval }} days.
													</p>
													<p v-if="f.anachron">
														Run with anachron, which loads code written for an older core on Drupal
														11.
													</p>
													<p v-if="f.baseOnly">
														None of this codebase's modules were enabled in the run, so these
														results describe the base site.
													</p>
													<p v-if="f.tested.length">
														<span class="text-highlighted font-semibold">Passed:</span>
														{{ f.tested.join(', ') }}
													</p>
													<p
														v-for="m in f.missing"
														:key="m.reason"
													>
														<span class="text-highlighted font-semibold"
															>{{ m.caps.length === f.total ? 'All' : m.caps.join(', ') }}:</span
														>
														{{ m.reason }}
													</p>
													<p v-if="f.credential">
														<span class="text-highlighted font-semibold">*</span>
														Needs read access to {{ f.credential }}. A site owner with that access
														passes it to <code>drangler build --project</code> in
														<code>auth.json</code>, which is the supported route. The test rig has
														no such credential, so it was not run here.
													</p>
												</div>
											</template>
										</UTooltip>
										<UTooltip
											v-if="f.certified && f.run?.plan === 'paid'"
											text="Certified on the paid plan. A pass on paid does not count toward free."
											:content="{ side: 'top' }"
											:ui="{ content: 'h-auto max-w-72 py-2 whitespace-normal' }"
										>
											<UBadge
												color="neutral"
												variant="outline"
												size="sm"
												tabindex="0"
												class="cursor-help"
												>Paid</UBadge
											>
										</UTooltip>
										<AnachronBadge v-if="f.anachron" />
									</div>
									<p
										v-if="f.failing.length"
										class="text-error mt-1 text-xs"
									>
										Failing in the latest run: {{ f.failing.join(', ') }}
									</p>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
			<p
				v-if="!shownFixtures"
				class="text-muted mt-6 text-center text-sm"
			>
				No codebases match.
			</p>
		</section>
	</div>
</template>

<script setup lang="ts">
import data from '~/data/fixtures.json';

const page = await usePageContent('/fixtures');

// verified, then partial (most capabilities first), needs upgrade, unsupported, pending
const rank = (f: (typeof data.fixtures)[number]) =>
	f.state === 'certified'
		? -2
		: f.state === 'deployed'
			? -1
			: f.state === 'verified'
				? 0
				: f.state === 'partial' && f.passed > 0
					? 1
					: f.state === 'needs-upgrade'
						? 2
						: f.state === 'partial'
							? 3
							: f.state === 'blocked'
								? 4
								: 5;
const fixtures = [...data.fixtures].sort((a, b) => rank(a) - rank(b) || b.passed - a.passed);
type Status = 'verified' | 'tested' | 'untested';
const modules = data.modules.map((m) => ({
	...m,
	status: (m.state === 'verified'
		? 'verified'
		: m.state === 'tested' || m.runsIn.length
			? 'tested'
			: 'untested') as Status
}));
const verifiedModules = modules.filter((m) => m.status === 'verified').length;
const testedModules = modules.filter((m) => m.status !== 'untested').length;
const testedContrib = modules.filter((m) => !m.custom && m.status !== 'untested').length;
const untestedModules = modules.length - testedModules;

const hostOf = (link: string) =>
	link.includes('drupal.org') ? 'drupal.org' : link.includes('github.com') ? 'GitHub' : 'Packagist';
const stateLabel: Record<Status, string> = {
	verified: 'Verified',
	tested: 'Tested',
	untested: 'Untested'
};
const stateDot: Record<Status, string> = {
	verified: 'bg-primary',
	tested: 'bg-neutral-900 dark:bg-white',
	untested: 'bg-neutral-500'
};
const stateText: Record<Status, string> = {
	verified: 'text-primary',
	tested: 'text-neutral-900 dark:text-white',
	untested: 'text-dimmed'
};
const anachronModules = modules.filter((m) => m.anachron).length;
const moduleFilters = [
	{ key: 'all', label: 'All', count: modules.length },
	{ key: 'verified', label: 'Verified', count: verifiedModules },
	{ key: 'tested', label: 'Tested', count: modules.filter((m) => m.status === 'tested').length },
	{ key: 'untested', label: 'Untested', count: untestedModules },
	{ key: 'anachron', label: 'Anachron', count: anachronModules },
	{ key: 'drupal', label: 'Drupal', count: modules.filter((m) => m.cms === 'drupal').length },
	{ key: 'codebase', label: 'In a Codebase', count: modules.filter((m) => m.runsIn.length).length },
	{ key: 'custom', label: 'Custom', count: modules.filter((m) => m.custom).length }
];
const showModules = ref(false);
const showMore = ref(false);
const fixtureQuery = ref('');
const fixtureFilter = ref('all');
const filter = ref('all');
const query = ref('');
const shownModules = computed(() => {
	const q = query.value.trim().toLowerCase();
	return modules.filter(
		(m) =>
			(filter.value === 'all' ||
				(filter.value === 'codebase'
					? m.runsIn.length > 0
					: filter.value === 'custom'
						? m.custom
						: filter.value === 'anachron'
							? m.anachron
							: filter.value === 'drupal'
								? m.cms === 'drupal'
								: m.status === filter.value)) &&
			(!q || m.name.toLowerCase().includes(q) || m.package.toLowerCase().includes(q))
	);
});
type Entry = {
	state: 'certified' | 'deployed' | 'none';
	sha: string;
	plan: string;
	date: string;
	expires: string;
	at?: string;
	source?: 'manual' | 'scheduled';
	intervalDays?: number;
	failing: string[];
};
type Row = (typeof fixtures)[number] & {
	certified: boolean;
	failing: string[];
	run?: Entry;
	interval: number;
};
const status = ref<{ intervalDays: number; fixtures: Record<string, Entry> } | null>(null);
onMounted(async () => {
	try {
		const res = await fetch('https://cdn.drupflare.com/certified/status.json');
		if (res.ok) status.value = await res.json();
	} catch {
		// the snapshot stands when the status file cannot be read
	}
});
// the published file wins once it has loaded; until then the snapshot's block stands. An entry
// applies only to the pinned commit it was run on, and only until its expiry date
const live = computed<Row[]>(() => {
	const today = new Date().toLocaleDateString('en-CA');
	return fixtures.map((f) => {
		const e = status.value
			? status.value.fixtures?.[f.id]
			: (f as { certification?: Entry | null }).certification;
		const run =
			e && e.sha?.slice(0, 10) === f.sha.slice(0, 10) && e.expires >= today ? e : undefined;
		const state = f.state === 'certified' ? 'deployed' : f.state;
		return {
			...f,
			state: run && run.state !== 'none' ? 'deployed' : state,
			certified: run?.state === 'certified',
			failing: run?.state === 'deployed' ? (run.failing ?? []) : [],
			run,
			interval: status.value?.intervalDays ?? run?.intervalDays ?? 0
		};
	});
});
const runSource = (run?: Entry) =>
	run?.source === 'manual' ? 'run by hand' : run?.source === 'scheduled' ? 'scheduled run' : '';
const groupLabels: Record<string, string> = {
	certified: 'Certified',
	deployed: 'Deployed',
	verified: 'Verified',
	partial: 'Partial',
	'needs-upgrade': 'Needs Upgrade',
	blocked: 'Blocked',
	pending: 'Pending',
	drupal7: 'Drupal 7'
};
const groupOf = (f: Row) =>
	f.certified ? 'certified' : f.core.startsWith('7.') ? 'drupal7' : f.state;
const matchesQuery = (f: Row) => {
	const q = fixtureQuery.value.trim().toLowerCase();
	return (
		!q ||
		[f.name, f.id, f.shape, f.core, f.sha, statusLabel(f)].some((v) => v.toLowerCase().includes(q))
	);
};
const groups = computed(() =>
	Object.entries(groupLabels)
		.map(([key, label]) => ({
			key,
			label,
			rows: live.value.filter(
				(f) =>
					groupOf(f) === key &&
					(fixtureFilter.value === 'all' || fixtureFilter.value === key) &&
					matchesQuery(f)
			)
		}))
		.filter((g) => g.rows.length)
);
const shownFixtures = computed(() => groups.value.reduce((n, g) => n + g.rows.length, 0));
const fixtureFilters = computed(() => [
	{ key: 'all', label: 'All', count: live.value.length },
	...Object.entries(groupLabels)
		.map(([key, label]) => ({
			key,
			label,
			count: live.value.filter((f) => groupOf(f) === key).length
		}))
		.filter((f) => f.count)
]);
const certifiedFixtures = computed(() => live.value.filter((f) => f.certified).length);
const deployedFixtures = computed(
	() => live.value.filter((f) => f.state === 'deployed' || f.certified).length
);
const verifiedFixtures = computed(
	() => live.value.filter((f) => f.state === 'verified').length + deployedFixtures.value
);
const partialFixtures = fixtures.filter((f) => f.state === 'partial' && f.passed > 0).length;
const ranFixtures = fixtures.filter(
	(f) => (f.total > 0 && f.state !== 'pending') || (f as { certification?: unknown }).certification
).length;

// needed by a site that edits content in production; one that does not is viable without them
const editorial = [
	{
		key: 'entity crud',
		label: 'Entity CRUD',
		why: 'creating, editing and deleting content through the admin.'
	},
	{
		key: 'file rw',
		label: 'File rw',
		why: 'storing uploads and reading them back.'
	},
	{
		key: 'queue cron',
		label: 'Queue cron',
		why: "cron maintenance and the queues editors' work feeds, such as search indexing."
	}
];
// capabilities any production site can do without; missing anything else is on the critical path
const optional = [
	{
		key: 'cache rebuild',
		label: 'Cache rebuild',
		why: "the admin's Clear All Caches button. Drupflare invalidates cached pages through Drupal's cache tags when content or configuration changes."
	},
	{
		key: 'outbound http',
		label: 'Outbound HTTP',
		why: 'only for a site that calls an outside service, such as update checks or a remote API.'
	},
	{
		key: 'update',
		label: 'Update',
		why: 'serving does not need it; upgrading modules safely does.'
	},
	{
		key: 'config import',
		label: 'Config import',
		why: 'only for a team that deploys through config sync.'
	},
	{
		key: 'module workflow',
		label: 'Module workflow',
		why: 'drangler can enable modules instead of the admin UI.'
	}
];
const optionalKeys = new Set([...editorial, ...optional].map((c) => c.key));
const critical = (f: Row) => f.missing.some((m) => m.caps.some((c) => !optionalKeys.has(c)));

const statusColor = (f: Row) =>
	f.certified
		? 'neutral'
		: f.state === 'deployed'
			? 'success'
			: f.state === 'verified'
				? 'primary'
				: f.state === 'needs-upgrade'
					? 'secondary'
					: f.state === 'blocked'
						? 'error'
						: f.state === 'partial'
							? f.passed === 0 || critical(f)
								? 'error'
								: 'warning'
							: 'neutral';

const statusLabel = (f: Row) =>
	f.certified
		? 'Certified'
		: f.state === 'deployed'
			? 'Deployed'
			: f.state === 'verified'
				? 'Verified'
				: f.state === 'partial'
					? f.passed === 0
						? 'Unsupported'
						: `${f.passed} of ${f.total} Capabilities`
					: f.state === 'needs-upgrade'
						? 'Needs Upgrade to 11'
						: f.state === 'blocked'
							? 'Blocked'
							: f.credential
								? 'Pending*'
								: 'Pending';
</script>
