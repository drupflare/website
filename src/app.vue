<template>
	<UApp>
		<div class="bg-default text-default flex min-h-screen w-full flex-col">
			<a
				href="#main"
				class="focus:bg-primary focus:text-inverted sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-md focus:px-3 focus:py-2 focus:font-medium"
				>Skip to Content</a
			>
			<NavBar />
			<main
				id="main"
				class="flex-1 pt-16"
			>
				<NuxtPage />
			</main>
			<Footer />
		</div>
	</UApp>
</template>

<script setup lang="ts">
const route = useRoute();

useHead({
	htmlAttrs: { lang: 'en' },
	meta: [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
		{ name: 'application-name', content: SITE_NAME },
		{ name: 'author', content: PERSON_NAME },
		{ name: 'theme-color', content: THEME_COLOR },
		{ name: 'color-scheme', content: 'dark light' },
		{ name: 'apple-mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
		{ name: 'apple-mobile-web-app-title', content: SITE_NAME },
		{ name: 'mobile-web-app-capable', content: 'yes' },
		{ name: 'msapplication-TileColor', content: THEME_COLOR }
	],
	link: [
		{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
		{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
		{ rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon-180.png' },
		{ rel: 'manifest', href: '/site.webmanifest' },
		{ rel: 'canonical', href: () => `${SITE_URL}${route.path === '/' ? '' : route.path}` }
	]
});

useSeoMeta({
	titleTemplate: (title) => (title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_TAGLINE}`),
	description: SITE_DESCRIPTION,
	ogTitle: SITE_NAME,
	ogDescription: SITE_DESCRIPTION,
	ogImage: `${SITE_URL}/og.png`,
	ogImageWidth: 1200,
	ogImageHeight: 630,
	ogImageAlt: 'Drupflare: Drupal, Minus the Server',
	ogLocale: 'en_US',
	ogType: 'website',
	ogSiteName: SITE_NAME,
	ogUrl: () => `${SITE_URL}${route.path === '/' ? '' : route.path}`,
	twitterCard: 'summary_large_image',
	twitterTitle: SITE_NAME,
	twitterDescription: SITE_DESCRIPTION,
	twitterImage: `${SITE_URL}/og.png`,
	twitterCreator: '@gmitch215'
});
</script>
