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
			<div class="flex flex-wrap items-baseline justify-between gap-3">
				<h2 class="text-highlighted text-2xl font-black">🧩 Contrib Modules</h2>
				<p class="text-muted text-sm">
					<span class="text-primary font-semibold">{{ verifiedModules }}</span> verified,
					{{ modules.length - verifiedModules }} untested
				</p>
			</div>
			<ul class="mt-6 grid gap-2 sm:grid-cols-2">
				<li
					v-for="m in modules"
					:key="m.package"
					class="min-w-0"
				>
					<details class="group border-default open:border-primary/50 rounded-lg border">
						<summary class="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
							<span
								class="size-2 shrink-0 rounded-full"
								:class="m.state === 'verified' ? 'bg-primary' : 'bg-neutral-500'"
								aria-hidden="true"
							/>
							<a
								:href="`https://www.drupal.org/project/${m.name}`"
								target="_blank"
								rel="noopener noreferrer"
								class="text-highlighted hover:text-primary min-w-0 truncate font-mono text-sm font-medium"
								@click.stop
								>{{ m.name }}</a
							>
							<UBadge
								v-if="m.shipping"
								color="neutral"
								variant="subtle"
								size="sm"
								>Ships</UBadge
							>
							<span class="text-dimmed ml-auto text-xs capitalize">{{ m.state }}</span>
							<UIcon
								name="i-lucide-chevron-down"
								class="text-dimmed size-4 transition group-open:rotate-180"
							/>
						</summary>
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
							<template v-else>No enable-and-assert run yet, so it is not claimed.</template>
						</p>
					</details>
				</li>
			</ul>
		</section>

		<section class="border-default mt-12 border-t pt-10">
			<div class="flex flex-wrap items-baseline justify-between gap-3">
				<h2 class="text-highlighted text-2xl font-black">🏛️ Production Codebases</h2>
				<p class="text-muted text-sm">
					<span class="text-primary font-semibold">{{ verifiedFixtures }}</span> of
					{{ fixtures.length }} verified, snapshot {{ data.generated }}
				</p>
			</div>
			<div class="border-default mt-6 overflow-x-auto rounded-lg border">
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
						<tr
							v-for="f in fixtures"
							:key="f.id"
						>
							<td class="px-4 py-3">
								<a
									:href="f.repo"
									target="_blank"
									rel="noopener noreferrer"
									class="text-highlighted hover:text-primary font-medium"
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
								<UBadge
									:color="
										f.state === 'verified'
											? 'primary'
											: f.state === 'partial'
												? 'warning'
												: 'neutral'
									"
									variant="subtle"
									size="sm"
									>{{ statusLabel(f) }}</UBadge
								>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import data from '~/data/fixtures.json';

const page = await usePageContent('/fixtures');

const modules = data.modules;
const fixtures = data.fixtures;
const verifiedModules = modules.filter((m) => m.state === 'verified').length;
const verifiedFixtures = fixtures.filter((f) => f.state === 'verified').length;

const statusLabel = (f: (typeof fixtures)[number]) =>
	f.state === 'verified'
		? `Verified ${f.date}`
		: f.state === 'partial'
			? `${f.passed} of ${f.total} Capabilities`
			: 'Pending';
</script>
