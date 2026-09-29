export const SITE_NAME = 'Drupflare';
export const SITE_URL = 'https://drupflare.com';
export const SITE_DESCRIPTION =
	'Drupal on Cloudflare Workers. No servers, no containers, no origin.';
export const THEME_COLOR = '#0a0a0a';
export const SITE_TAGLINE = 'Drupal on Cloudflare Workers';

export const GITHUB_ORG = 'https://github.com/drupflare';
export const WORKER_REPO = 'https://github.com/drupflare/worker';
export const DEMO_URL = 'https://demo.drupflare.com';
export const DEPLOY_URL =
	'https://deploy.workers.cloudflare.com/?url=https://github.com/drupflare/worker';

/** the managed-platform interest form, reached through the site's own redirect */
export const WAITLIST_URL = '/interest';

export interface LinkItem {
	name: string;
	url: string;
	icon?: string;
}

export const NAV_LINKS: LinkItem[] = [
	{ name: 'Why', url: '/why', icon: 'i-lucide-flame' },
	{ name: 'Migrate', url: '/migrate', icon: 'i-lucide-truck' },
	{ name: 'Self-Managed', url: '/self-managed', icon: 'i-lucide-rocket' },
	{ name: 'How-To', url: '/how-to', icon: 'i-lucide-book-open' },
	{ name: 'drangler', url: '/drangler', icon: 'i-lucide-terminal' },
	{ name: 'Fixtures', url: '/fixtures', icon: 'i-lucide-flask-conical' },
	{ name: 'About', url: '/about', icon: 'i-lucide-user' }
];

export const PERSON_NAME = 'Gregory R. Mitchell';
export const PERSON_EMAIL = 'me@gmitch215.xyz';
export const GRAVATAR_HASH = '0a21a5244a8953b2afe451dbf2978755b27aab8b84a80400e551775dd456327b';

export const gravatarUrl = (size = 200) =>
	`https://gravatar.com/avatar/${GRAVATAR_HASH}?s=${size}&d=identicon`;

export const PERSON_LINKS: LinkItem[] = [
	{ name: 'gmitch215.dev', url: 'https://gmitch215.dev', icon: 'i-lucide-globe' },
	{ name: 'GitHub', url: 'https://github.com/gmitch215', icon: 'uil:github' },
	{ name: 'LinkedIn', url: 'https://www.linkedin.com/in/gmitch215', icon: 'uil:linkedin' },
	{ name: 'Blog', url: 'https://gmitch215.blog', icon: 'i-lucide-pen-line' }
];
