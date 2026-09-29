/** the content page at `path`, with its seo meta applied; 404s when there is none */
export function usePageContent(path: string) {
	const request = useAsyncData(`page:${path}`, () => queryCollection('content').path(path).first());
	// registered before the await, which is the last point the nuxt instance is in scope
	const title = () => request.data.value?.title || undefined;
	const description = () => request.data.value?.description || undefined;
	useSeoMeta({
		title,
		description,
		ogTitle: () => (title() ? `${title()} | ${SITE_NAME}` : undefined),
		ogDescription: description,
		twitterTitle: () => (title() ? `${title()} | ${SITE_NAME}` : undefined),
		twitterDescription: description
	});

	return request.then(({ data }) => {
		if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
		return data;
	});
}
