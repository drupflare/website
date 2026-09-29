import { defineCollection, defineContentConfig, z } from '@nuxt/content';

const item = z.object({
	emoji: z.string(),
	name: z.string(),
	blurb: z.string(),
	url: z.string().optional(),
	when: z.string().optional()
});

export default defineContentConfig({
	collections: {
		content: defineCollection({
			type: 'page',
			source: {
				include: '**/*.md',
				cwd: './src/content'
			},
			schema: z.object({
				title: z.string().optional(),
				description: z.string().optional(),
				headline: z.string().optional(),
				accent: z.string().optional(),
				intro: z.string().optional(),
				stats: z
					.array(z.object({ emoji: z.string(), value: z.string(), label: z.string() }))
					.default([]),
				repos: z.array(item).default([]),
				coming: z.array(item).default([])
			})
		})
	}
});
