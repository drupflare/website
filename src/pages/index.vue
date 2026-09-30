<template>
	<div
		v-if="page"
		class="relative"
	>
		<div
			class="hero-glow pointer-events-none absolute inset-x-0 top-0 h-144"
			aria-hidden="true"
		/>

		<div class="relative mx-auto max-w-5xl px-4 sm:px-6">
			<section class="pt-16 pb-16 text-center sm:pt-24 sm:text-left">
				<NuxtImg
					src="/drupflare.png"
					alt="Drupflare"
					width="80"
					height="80"
					class="rise mx-auto size-16 sm:mx-0 sm:size-20"
				/>
				<h1
					class="rise text-highlighted mx-auto mt-8 max-w-4xl text-5xl sm:mx-0 leading-[1.05] font-black tracking-tight sm:text-7xl"
					style="animation-delay: 80ms"
				>
					{{ page.headline }}
					<span class="text-primary block">{{ page.accent }}</span>
				</h1>
				<p
					class="rise text-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:mx-0"
					style="animation-delay: 160ms"
				>
					{{ page.intro }}
				</p>
				<div
					class="rise mt-8 flex flex-wrap justify-center gap-3 sm:justify-start"
					style="animation-delay: 240ms"
				>
					<UButton
						:to="DEPLOY_URL"
						target="_blank"
						rel="noopener noreferrer"
						size="xl"
						icon="i-lucide-rocket"
						class="lift"
					>
						Deploy to Cloudflare
					</UButton>
					<UButton
						:to="DEMO_URL"
						target="_blank"
						rel="noopener noreferrer"
						size="xl"
						color="neutral"
						variant="outline"
						icon="i-lucide-mouse-pointer-click"
						class="lift"
					>
						Try the Demo
					</UButton>
					<UButton
						to="/why"
						size="xl"
						color="neutral"
						variant="ghost"
						trailing-icon="i-lucide-arrow-right"
						class="lift"
					>
						Why Drupflare
					</UButton>
				</div>
			</section>

			<section class="stats-band grid grid-cols-2 sm:grid-cols-4">
				<NuxtLink
					v-for="stat in page.stats"
					:key="stat.value"
					to="/why"
					class="group hover:bg-muted/60 my-2 rounded-lg px-3 py-5 text-center sm:text-left transition-colors duration-200 sm:px-4"
				>
					<p class="wiggle inline-block text-2xl">{{ stat.emoji }}</p>
					<p
						class="font-display text-primary mt-2 text-4xl font-black transition-transform duration-200 group-hover:-translate-y-0.5 sm:text-5xl"
					>
						<CountUp :value="stat.value" />
					</p>
					<p class="text-muted group-hover:text-default mt-2 text-sm transition-colors">
						{{ stat.label }}
					</p>
				</NuxtLink>
			</section>

			<section class="mt-24">
				<p
					class="text-primary text-center text-sm font-semibold tracking-wide uppercase sm:text-left"
				>
					<span class="mr-2">☁️</span>Cloudflare-Native
				</p>
				<h2 class="text-highlighted mt-2 text-center text-3xl font-black sm:text-left sm:text-4xl">
					How It Runs
				</h2>
				<p
					class="text-muted mx-auto mt-3 max-w-2xl text-center leading-relaxed sm:mx-0 sm:text-left"
				>
					Every piece of a Drupal host maps onto a Cloudflare primitive.
					<strong class="text-primary font-bold"
						>There is no origin server behind any of it.</strong
					>
				</p>
				<ul class="mt-8 grid gap-3 sm:grid-cols-3">
					<li
						v-for="part in primitives"
						:key="part.name"
						class="group border-default rounded-lg border p-4"
					>
						<p class="flex items-center gap-2">
							<span class="wiggle inline-block text-xl">{{ part.emoji }}</span>
							<span class="text-highlighted font-semibold">{{ part.name }}</span>
						</p>
						<p class="text-muted mt-1 text-sm">{{ part.blurb }}</p>
					</li>
				</ul>
			</section>

			<section class="mt-24">
				<p
					class="text-primary text-center text-sm font-semibold tracking-wide uppercase sm:text-left"
				>
					<span class="mr-2">🚚</span>Frictionless Conversion
				</p>
				<h2 class="text-highlighted mt-2 text-center text-3xl font-black sm:text-left sm:text-4xl">
					Bring the Site You Have
				</h2>
				<p
					class="text-muted mx-auto mt-3 max-w-2xl text-center leading-relaxed sm:mx-0 sm:text-left"
				>
					<strong class="text-primary font-bold">No rebuild.</strong> drangler reads your current
					server, tells you what will change before anything moves, converts the database, and keeps
					the way back open.
				</p>
				<ol class="mt-8 grid gap-3 sm:grid-cols-4">
					<li
						v-for="(step, i) in steps"
						:key="step.name"
						class="group border-default rounded-lg border p-4"
					>
						<p class="flex items-center justify-between">
							<span class="wiggle inline-block text-2xl">{{ step.emoji }}</span>
							<span class="text-dimmed font-mono text-sm">0{{ i + 1 }}</span>
						</p>
						<p class="text-highlighted mt-3 font-semibold">{{ step.name }}</p>
						<p class="text-muted mt-1 text-sm">{{ step.blurb }}</p>
					</li>
				</ol>
				<div class="border-default bg-muted/40 mt-6 rounded-lg border p-5">
					<p class="text-highlighted font-semibold">
						<span class="mr-2">⚡</span>All Four in One Command
					</p>
					<p class="text-muted mt-1 text-sm leading-relaxed">
						<code class="text-primary">drangler preview</code> copies the database, the uploaded
						files, the custom modules and themes, the settings and the server's redirects and
						headers into a working duplicate you can click through.
						<strong class="text-primary font-bold"
							>Every command it sends to the old server is read-only</strong
						>, and the live site keeps serving the whole time.
					</p>
					<pre
						class="bg-default border-default mt-4 overflow-x-auto rounded-md border px-4 py-3 text-sm"
					><code>drangler preview --host deploy@old.example --root /var/www/html</code></pre>
				</div>
				<div class="mt-6 text-center sm:text-left">
					<UButton
						to="/migrate"
						color="neutral"
						variant="outline"
						trailing-icon="i-lucide-arrow-right"
						class="lift"
					>
						How Migration Works
					</UButton>
				</div>
			</section>

			<section class="mt-24">
				<p
					class="text-primary text-center text-sm font-semibold tracking-wide uppercase sm:text-left"
				>
					<span class="mr-2">🔬</span>Evidence, Not Claims
				</p>
				<h2 class="text-highlighted mt-2 text-center text-3xl font-black sm:text-left sm:text-4xl">
					Tested Against Real Drupal
				</h2>
				<div class="mt-8 grid gap-3 sm:grid-cols-2">
					<NuxtLink
						v-for="proof in proofs"
						:key="proof.label"
						to="/fixtures"
						class="group border-default hover:border-primary/60 rounded-lg border p-5 transition duration-200 hover:-translate-y-1"
					>
						<p class="font-display text-primary text-5xl font-black">
							<CountUp :value="String(proof.value)" />
						</p>
						<p class="text-highlighted mt-2 font-semibold">{{ proof.label }}</p>
						<p class="text-muted mt-1 text-sm">{{ proof.blurb }}</p>
					</NuxtLink>
				</div>
			</section>

			<section class="border-default mt-24 grid gap-6 rounded-lg border p-6 sm:grid-cols-5 sm:p-8">
				<div class="text-center sm:col-span-2 sm:text-left">
					<p class="text-primary text-sm font-semibold tracking-wide uppercase">
						<span class="mr-2">🏰</span>Self-Hosted
					</p>
					<h2 class="text-highlighted mt-2 text-3xl font-black">Your Servers, Too</h2>
				</div>
				<div class="text-muted text-center leading-relaxed sm:col-span-3 sm:text-left">
					<p>
						Data-residency rules or a campus network? bastion runs
						<strong class="text-primary font-bold"
							>the same Drupflare release on your own Linux servers</strong
						>
						as one binary, with the TLS, tenant limits, storage, backups and metrics Cloudflare
						would otherwise provide. It serves the same release, unmodified.
					</p>
					<div class="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
						<UButton
							to="/how-to#on-your-own-servers"
							color="neutral"
							variant="outline"
							trailing-icon="i-lucide-arrow-right"
							class="lift"
						>
							Run It On-Premises
						</UButton>
						<UButton
							:to="`${GITHUB_ORG}/bastion`"
							target="_blank"
							rel="noopener noreferrer"
							color="neutral"
							variant="ghost"
							icon="uil:github"
							class="lift"
						>
							bastion
						</UButton>
					</div>
				</div>
			</section>

			<section class="mt-24 grid gap-10 sm:grid-cols-5">
				<div class="sm:col-span-2">
					<p
						class="text-primary text-center text-sm font-semibold tracking-wide uppercase sm:text-left"
					>
						<span class="mr-2">🧡</span>Coming Soon
					</p>
					<h2
						class="text-highlighted mt-2 text-center text-3xl font-black sm:text-left sm:text-4xl"
					>
						Managed Hosting
					</h2>
				</div>
				<div class="text-muted text-center leading-relaxed sm:col-span-3 sm:text-left">
					<ContentRenderer :value="page" />
					<div class="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start">
						<UButton
							v-if="WAITLIST_URL"
							:to="WAITLIST_URL"
							external
							icon="i-lucide-mail"
							class="lift"
						>
							Join the Waitlist
						</UButton>
						<UButton
							to="/how-to"
							color="neutral"
							variant="outline"
							trailing-icon="i-lucide-arrow-right"
							class="lift"
						>
							Run It Yourself
						</UButton>
					</div>
				</div>
			</section>

			<section class="mt-24">
				<p
					class="text-primary text-center text-sm font-semibold tracking-wide uppercase sm:text-left"
				>
					<span class="mr-2">🧭</span>On the Way
				</p>
				<h2 class="text-highlighted mt-2 text-center text-3xl font-black sm:text-left sm:text-4xl">
					More Than Drupal
				</h2>
				<p
					class="text-muted mx-auto mt-3 max-w-2xl text-center leading-relaxed sm:mx-0 sm:text-left"
				>
					The runtime underneath is not specific to Drupal.
					<strong class="text-primary font-bold">The same deploy will host other CMSs</strong>,
					other Workers apps and your own templates.
				</p>
				<ul class="mt-8 grid gap-3 sm:grid-cols-2">
					<li
						v-for="item in page.coming"
						:key="item.name"
					>
						<component
							:is="item.url ? 'a' : 'div'"
							:href="item.url"
							:target="item.url ? '_blank' : undefined"
							:rel="item.url ? 'noopener noreferrer' : undefined"
							class="group border-default hover:border-primary/60 flex h-full items-start gap-4 rounded-lg border p-4 transition duration-200 hover:-translate-y-1"
						>
							<span class="wiggle inline-block text-2xl leading-none">{{ item.emoji }}</span>
							<span class="min-w-0 flex-1">
								<span class="flex items-center gap-2">
									<span class="text-highlighted font-semibold">{{ item.name }}</span>
									<UBadge
										:color="item.when === 'Next' ? 'primary' : 'neutral'"
										variant="subtle"
										size="sm"
										>{{ item.when }}</UBadge
									>
								</span>
								<span class="text-muted mt-1 block text-sm">{{ item.blurb }}</span>
							</span>
						</component>
					</li>
				</ul>
			</section>

			<section class="mt-24">
				<p
					class="text-primary text-center text-sm font-semibold tracking-wide uppercase sm:text-left"
				>
					<span class="mr-2">🛠️</span>Today
				</p>
				<h2 class="text-highlighted mt-2 text-center text-3xl font-black sm:text-left sm:text-4xl">
					Open Source, All of It
				</h2>
				<p
					class="text-muted mx-auto mt-3 max-w-2xl text-center leading-relaxed sm:mx-0 sm:text-left"
				>
					The whole stack is on GitHub under
					<strong class="text-primary font-bold">the MIT license</strong>, from the interpreter to
					the CLI.
				</p>
				<ul class="border-default divide-default mt-8 divide-y border-y">
					<li
						v-for="repo in page.repos"
						:key="repo.name"
					>
						<a
							:href="`${GITHUB_ORG}/${repo.name}`"
							target="_blank"
							rel="noopener noreferrer"
							class="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
						>
							<span class="w-6 shrink-0 text-lg">{{ repo.emoji }}</span>
							<span
								class="text-highlighted group-hover:text-primary shrink-0 font-mono text-sm font-medium transition duration-200 group-hover:translate-x-1 sm:w-32"
								>{{ repo.name }}</span
							>
							<span
								class="text-muted order-last basis-full pl-10 text-sm sm:order-none sm:flex-1 sm:basis-auto sm:pl-0"
								>{{ repo.blurb }}</span
							>
							<UIcon
								name="i-lucide-arrow-up-right"
								class="text-dimmed group-hover:text-primary ml-auto size-4 shrink-0 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:order-last sm:ml-0"
							/>
						</a>
					</li>
				</ul>
			</section>

			<section
				id="built-by"
				class="border-default mt-24 grid scroll-mt-24 gap-6 border-t pt-12 sm:grid-cols-5"
			>
				<div
					class="flex flex-col items-center gap-4 text-center sm:col-span-2 sm:items-start sm:text-left"
				>
					<img
						:src="gravatarUrl(256)"
						:alt="PERSON_NAME"
						width="96"
						height="96"
						loading="lazy"
						class="border-default size-24 rounded-full border"
					/>
					<div>
						<p class="text-primary text-sm font-semibold tracking-wide uppercase">
							<span class="mr-2">👋</span>Built By
						</p>
						<h2 class="text-highlighted mt-1 text-3xl font-black">
							<a
								:href="PERSON_URL"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-primary transition-colors"
								>{{ PERSON_NAME }}</a
							>
						</h2>
						<p class="text-muted mt-1 text-sm">Computer Science at Dartmouth</p>
					</div>
				</div>
				<div class="text-muted space-y-4 text-center leading-relaxed sm:col-span-3 sm:text-left">
					<p>
						<a
							:href="PERSON_URL"
							target="_blank"
							rel="noopener noreferrer"
							class="text-highlighted underline-offset-4 hover:underline"
							>Gregory</a
						>
						started writing code with Drupal and PHP in late 2018, building websites inside
						brightplum, his father's shop. Drupflare is that first framework coming back around: the
						goal is to
						<strong class="text-primary font-bold"
							>run the Drupal sites people already have, unchanged</strong
						>, without a server underneath them.
					</p>
					<p>
						He also built
						<a
							href="https://earth-app.com"
							target="_blank"
							rel="noopener noreferrer"
							class="text-highlighted underline-offset-4 hover:underline"
							>The Earth App</a
						>, a live mobile app aimed at loneliness, spent two summers teaching Computer Science to
						7th through 9th graders in Chicago, and is now at Dartmouth majoring in Computer Science
						with a minor in Quantitative Social Science.
					</p>
					<ul class="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
						<li
							v-for="link in PERSON_LINKS"
							:key="link.url"
						>
							<UButton
								:to="link.url"
								:icon="link.icon"
								target="_blank"
								rel="noopener noreferrer"
								color="neutral"
								variant="outline"
								size="sm"
							>
								{{ link.name }}
							</UButton>
						</li>
						<li>
							<UButton
								:to="`mailto:${PERSON_EMAIL}`"
								icon="i-lucide-mail"
								color="neutral"
								variant="outline"
								size="sm"
							>
								{{ PERSON_EMAIL }}
							</UButton>
						</li>
					</ul>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import fixtures from '~/data/fixtures.json';

const page = await usePageContent('/');

useSchemaOrg([
	defineSoftwareApp({
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Cloudflare Workers',
		url: SITE_URL,
		downloadUrl: WORKER_REPO,
		offers: { price: 0, priceCurrency: 'USD' }
	})
]);

const primitives = [
	{
		emoji: '⚡',
		name: 'Workers',
		blurb: 'The front door: routing, redirects, headers and the edge page cache.'
	},
	{
		emoji: '🧱',
		name: 'Durable Objects',
		blurb: 'One per site, holding PHP 8.5 as WebAssembly and the site itself.'
	},
	{
		emoji: '🗄️',
		name: 'Durable Object SQLite',
		blurb: "Drupal's database, in the same object as PHP, with no network hop."
	},
	{
		emoji: '📦',
		name: 'Workers Assets',
		blurb: 'Drupal core, themes and CSS, served without waking the site.'
	},
	{
		emoji: '🔑',
		name: 'KV',
		blurb: 'Runtime settings, and stored pages shared across locations.'
	},
	{
		emoji: '📋',
		name: 'D1',
		blurb: 'An inventory of every site, once you run more than one.'
	}
];

const tested = fixtures.modules.filter(
	(m) => m.state === 'verified' || m.state === 'tested' || m.runsIn.length
);

const proofs = [
	{
		value: fixtures.fixtures.length,
		label: 'Production Codebases in the Test Corpus',
		blurb:
			'Government, university, non-profit and product sites, each pinned to an exact commit, with every lane result published.'
	},
	{
		value: tested.length,
		label: 'Modules Tested',
		blurb: `Including ${tested.filter((m) => !m.custom).length} contrib. ${fixtures.modules.filter((m) => m.state === 'verified').length} verified with a test asserting something the module owns; the rest run in a production codebase that passed every capability check.`
	}
];

const steps = [
	{ emoji: '🔎', name: 'Survey', blurb: 'Read the current server over SSH. Nothing is written.' },
	{ emoji: '🚦', name: 'Verdict', blurb: 'GO, GO WITH CHANGES or NO, with a reason for each.' },
	{ emoji: '🔁', name: 'Convert', blurb: 'The database moves to SQLite, backed up first.' },
	{ emoji: '🚀', name: 'Deploy', blurb: 'Cut over with a checklist, and move back any time.' }
];
</script>
