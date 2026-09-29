<template>
	<footer class="border-default mt-24 border-t">
		<div
			class="text-muted mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-10 text-center text-sm sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:text-left"
		>
			<div class="max-w-sm space-y-2">
				<p class="text-highlighted font-display font-bold">{{ SITE_NAME }}</p>
				<p>
					Open source under the MIT license. Drupal is a registered trademark of Dries Buytaert.
					Drupflare is not affiliated with or endorsed by the Drupal Association or Cloudflare.
				</p>
			</div>
			<ul class="flex flex-wrap justify-center gap-x-6 sm:flex-col sm:justify-start">
				<li
					v-for="link in NAV_LINKS"
					:key="link.url"
				>
					<NuxtLink
						:to="link.url"
						class="hover:text-primary inline-block py-1.5"
						>{{ link.name }}</NuxtLink
					>
				</li>
				<li>
					<a
						:href="DEMO_URL"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-primary inline-block py-1.5"
						>Live Demo</a
					>
				</li>
				<li>
					<a
						:href="GITHUB_ORG"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-primary inline-block py-1.5"
						>GitHub</a
					>
				</li>
			</ul>
		</div>
	</footer>
</template>
