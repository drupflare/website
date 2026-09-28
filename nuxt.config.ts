import { defineOrganization } from 'nuxt-schema-org/schema';

export default defineNuxtConfig({
	ssr: true,
	compatibilityDate: '2026-08-01',
	devtools: { enabled: process.env.NODE_ENV !== 'production' },
	srcDir: 'src',
	site: {
		url: 'https://drupflare.com',
		name: 'Drupflare'
	},
	css: ['~/assets/css/main.css'],
	components: [{ path: '~/components', pathPrefix: false }],
	app: {
		head: {
			link: [
				{ rel: 'preconnect', href: 'https://gravatar.com' },
				{ rel: 'dns-prefetch', href: 'https://gravatar.com' }
			]
		}
	},
	nitro: {
		preset: 'static',
		prerender: {
			crawlLinks: true,
			routes: ['/', '/sitemap.xml']
		}
	},
	modules: [
		'@nuxt/ui',
		'@vueuse/nuxt',
		'@nuxt/content',
		'@nuxt/image',
		'@nuxtjs/robots',
		'@nuxtjs/sitemap',
		'nuxt-schema-org',
		'@nuxt/hints'
	],
	colorMode: {
		preference: 'dark',
		fallback: 'dark'
	},
	image: {
		format: ['avif', 'webp'],
		quality: 80
	},
	experimental: {
		renderJsonPayloads: true,
		viewTransition: true
	},
	schemaOrg: {
		identity: defineOrganization({
			name: 'Drupflare'
		})
	}
});
