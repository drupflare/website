<template>
	<section class="border-default group grid gap-6 border-t py-12 sm:grid-cols-5">
		<div class="text-center sm:col-span-2 sm:text-left">
			<p class="text-3xl transition duration-200 group-hover:-translate-y-1">{{ emoji }}</p>
			<p class="font-display text-primary mt-2 text-5xl font-black sm:text-6xl">
				<CountUp :value="figure" />
			</p>
			<h2 class="text-highlighted mt-3 text-xl font-bold">{{ title }}</h2>
		</div>
		<div class="text-muted leading-relaxed sm:col-span-3">
			<slot />
		</div>
	</section>
</template>

<script setup lang="ts">
defineProps<{ emoji: string; figure: string; title: string }>();
</script>
