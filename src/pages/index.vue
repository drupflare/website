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
					<span class="mr-2">🚚</span>Frictionless Conversion
				</p>
				<h2 class="text-highlighted mt-2 text-center text-3xl font-black sm:text-left sm:text-4xl">
					Bring the Site You Have
				</h2>
				<p
					class="text-muted mx-auto mt-3 max-w-2xl text-center leading-relaxed sm:mx-0 sm:text-left"
				>
					No rebuild. drangler reads your current server, tells you what will change before anything
					moves, converts the database, and keeps the way back open.
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
							to="/self-managed"
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
					The runtime underneath is not specific to Drupal. The same deploy will host other CMSs,
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
					Self-Host It Now
				</h2>
				<p
					class="text-muted mx-auto mt-3 max-w-2xl text-center leading-relaxed sm:mx-0 sm:text-left"
				>
					The whole stack is on GitHub under the MIT license, from the interpreter to the CLI.
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
		</div>
	</div>
</template>

<script setup lang="ts">
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

const steps = [
	{ emoji: '🔎', name: 'Survey', blurb: 'Read the current server over SSH. Nothing is written.' },
	{ emoji: '🚦', name: 'Verdict', blurb: 'GO, GO WITH CHANGES or NO, with a reason for each.' },
	{ emoji: '🔁', name: 'Convert', blurb: 'The database moves to SQLite, backed up first.' },
	{ emoji: '🚀', name: 'Deploy', blurb: 'Cut over with a checklist, and move back any time.' }
];
</script>
