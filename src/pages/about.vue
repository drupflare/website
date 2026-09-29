<template>
	<div class="mx-auto max-w-3xl px-4 sm:px-6">
		<header
			class="flex flex-col items-center gap-6 pt-16 pb-10 text-center sm:flex-row sm:pt-20 sm:text-left"
		>
			<img
				:src="gravatarUrl(256)"
				:alt="PERSON_NAME"
				width="112"
				height="112"
				class="border-default size-28 rounded-full border"
			/>
			<div>
				<p class="text-primary text-sm font-semibold tracking-wide uppercase">
					<span class="mr-2">👋</span>Built By
				</p>
				<h1 class="text-highlighted mt-1 text-4xl font-extrabold tracking-tight">
					{{ PERSON_NAME }}
				</h1>
				<p class="text-muted mt-2">Computer Science at Dartmouth</p>
			</div>
		</header>

		<section class="text-muted border-default border-t pt-6 leading-relaxed">
			<ContentRenderer
				v-if="page"
				:value="page"
			/>
		</section>

		<section class="border-default mt-10 border-t pt-10">
			<h2 class="text-highlighted text-center text-xl font-bold sm:text-left">🔗 Find Him</h2>
			<ul class="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
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
					>
						{{ PERSON_EMAIL }}
					</UButton>
				</li>
			</ul>
		</section>

		<section class="border-default mt-10 border-t pt-10 text-center sm:text-left">
			<h2 class="text-highlighted text-center text-xl font-bold sm:text-left">🐘 The Project</h2>
			<p class="text-muted mt-3 text-center leading-relaxed sm:text-left">
				Drupflare is open source under the MIT license and developed in the open on GitHub, across
				the runtime, the Drupal module, the database driver, the interpreter and the CLI.
			</p>
			<UButton
				:to="GITHUB_ORG"
				target="_blank"
				rel="noopener noreferrer"
				icon="uil:github"
				class="mt-5"
			>
				github.com/drupflare
			</UButton>
		</section>
	</div>
</template>

<script setup lang="ts">
const page = await usePageContent('/about');
</script>
