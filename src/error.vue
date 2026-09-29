<template>
	<UApp>
		<div class="bg-default text-default flex min-h-screen flex-col">
			<NavBar />
			<main class="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pt-16 sm:px-6">
				<p class="font-display text-primary text-7xl font-extrabold">{{ error?.statusCode }}</p>
				<h1 class="text-highlighted mt-4 text-3xl font-bold">
					{{ error?.statusCode === 404 ? 'This Page is Not Cached Anywhere' : 'Something Broke' }}
				</h1>
				<p class="text-muted mt-3 max-w-xl">
					{{
						error?.statusCode === 404
							? 'Nothing at the edge, in the Durable Object or in the database answers to this address.'
							: error?.message
					}}
				</p>
				<div class="mt-8">
					<UButton
						icon="i-lucide-arrow-left"
						@click="clearError({ redirect: '/' })"
					>
						Back Home
					</UButton>
				</div>
			</main>
			<Footer />
		</div>
	</UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{ error: NuxtError }>();
</script>
