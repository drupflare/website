<template>
	<div
		v-if="page"
		class="mx-auto max-w-4xl px-4 sm:px-6"
	>
		<header class="pt-16 pb-6 text-center sm:pt-20 sm:text-left">
			<h1 class="rise text-highlighted text-4xl font-black tracking-tight sm:text-6xl">
				{{ page.headline ?? page.title }}
			</h1>
			<p
				v-if="page.intro"
				class="rise text-muted mt-5 text-lg leading-relaxed"
				style="animation-delay: 100ms"
			>
				{{ page.intro }}
			</p>
		</header>
		<ContentRenderer :value="page" />
	</div>
</template>

<script setup lang="ts">
const route = useRoute();
const page = await usePageContent(route.path.replace(/\/$/, '') || '/');
</script>
