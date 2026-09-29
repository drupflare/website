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
			routes: [
				'/',
				'/why',
				'/migrate',
				'/self-managed',
				'/how-to',
				'/drangler',
				'/fixtures',
				'/about',
				'/interest',
				'/sitemap.xml'
			]
		}
	},
	routeRules: {
		'/interest': { redirect: 'https://forms.gle/f23bw3DmfZ1w2tin8' }
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
	icon: {
		clientBundle: { scan: true, sizeLimitKb: 256 }
	},
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
	sitemap: {
		exclude: ['/interest']
	},
	schemaOrg: {
		identity: defineOrganization({
			name: 'Drupflare',
			url: 'https://drupflare.com',
			logo: '/drupflare.png',
			description:
				'Open-source hosting that runs unmodified Drupal on Cloudflare Workers, with no servers to patch.',
			sameAs: ['https://github.com/drupflare', 'https://www.npmjs.com/package/@drupflare/drangler']
		})
	}
});
