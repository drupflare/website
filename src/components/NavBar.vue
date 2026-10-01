<template>
	<header class="border-default bg-default fixed inset-x-0 top-0 z-50 border-b">
		<nav class="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
			<NuxtLink
				to="/"
				class="flex items-center gap-2"
			>
				<NuxtImg
					src="/drupflare.png"
					alt=""
					width="28"
					height="28"
					class="size-7"
				/>
				<span class="font-display text-highlighted text-lg font-bold tracking-tight">
					{{ SITE_NAME }}
				</span>
			</NuxtLink>

			<div class="ml-4 hidden items-center gap-1 md:flex">
				<UButton
					v-for="link in NAV_LINKS"
					:key="link.url"
					:to="link.url"
					variant="ghost"
					size="sm"
					:color="route.path === link.url ? 'primary' : 'neutral'"
				>
					{{ link.name }}
				</UButton>
			</div>

			<div class="ml-auto flex items-center gap-1">
				<UButton
					:to="DOCS_URL"
					target="_blank"
					rel="noopener noreferrer"
					color="neutral"
					variant="ghost"
					size="sm"
					icon="i-lucide-book-text"
					class="max-sm:hidden"
				>
					Docs
				</UButton>
				<UButton
					:to="DOCS_URL"
					target="_blank"
					rel="noopener noreferrer"
					color="neutral"
					variant="ghost"
					icon="i-lucide-book-text"
					aria-label="Docs"
					class="sm:hidden"
				/>
				<UButton
					:to="GITHUB_ORG"
					target="_blank"
					rel="noopener noreferrer"
					color="neutral"
					variant="ghost"
					icon="uil:github"
					aria-label="GitHub"
				/>
				<ClientOnly>
					<UColorModeButton />
					<template #fallback>
						<div class="size-8" />
					</template>
				</ClientOnly>
				<UButton
					:to="DEPLOY_URL"
					target="_blank"
					rel="noopener noreferrer"
					size="sm"
					class="ml-1 hidden sm:inline-flex"
				>
					Deploy
				</UButton>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-menu"
					class="md:hidden"
					aria-label="Open Menu"
					@click="open = true"
				/>
			</div>
		</nav>

		<USlideover
			v-model:open="open"
			:title="SITE_NAME"
			side="right"
		>
			<template #body>
				<div class="flex flex-col gap-1">
					<UButton
						v-for="link in NAV_LINKS"
						:key="link.url"
						:to="link.url"
						:icon="link.icon"
						variant="ghost"
						size="lg"
						block
						class="justify-start"
						:color="route.path === link.url ? 'primary' : 'neutral'"
					>
						{{ link.name }}
					</UButton>
					<UButton
						:to="DOCS_URL"
						target="_blank"
						rel="noopener noreferrer"
						icon="i-lucide-book-text"
						variant="ghost"
						color="neutral"
						size="lg"
						block
						class="justify-start"
					>
						Docs
					</UButton>
					<UButton
						:to="DEPLOY_URL"
						target="_blank"
						rel="noopener noreferrer"
						size="lg"
						block
						class="mt-2"
						icon="i-lucide-rocket"
					>
						Deploy to Cloudflare
					</UButton>
				</div>
			</template>
		</USlideover>
	</header>
</template>

<script setup lang="ts">
const route = useRoute();
const open = ref(false);

watch(
	() => route.path,
	() => (open.value = false)
);
</script>
