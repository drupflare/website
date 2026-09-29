<template>
	<span
		ref="el"
		class="tabular-nums"
		>{{ shown }}</span
	>
</template>

<script setup lang="ts">
const props = defineProps<{ value: string }>();

// prefix, number, suffix: "1,500x" -> ["", "1,500", "x"]; a value with no number renders as-is
const parts = computed(() => props.value.match(/^([^\d]*)([\d,.]+)(.*)$/));
const target = computed(() => Number(parts.value?.[2]?.replace(/,/g, '') ?? 0));
const decimals = computed(() => parts.value?.[2]?.split('.')[1]?.length ?? 0);
const grouped = computed(() => parts.value?.[2]?.includes(',') ?? false);

const format = (n: number) => {
	if (!parts.value) return props.value;
	const num = grouped.value
		? n.toLocaleString('en-US', {
				minimumFractionDigits: decimals.value,
				maximumFractionDigits: decimals.value
			})
		: n.toFixed(decimals.value);
	return `${parts.value[1]}${num}${parts.value[3]}`;
};

// the server renders the final value, so no-JS readers and crawlers see the real figure
const shown = ref(props.value);
const el = ref<HTMLElement | null>(null);

onMounted(() => {
	if (!parts.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	// the real figure stays until the element is seen, so nothing ever renders a static zero
	const { stop } = useIntersectionObserver(
		el,
		([entry]) => {
			if (!entry?.isIntersecting) return;
			stop();
			const start = performance.now();
			const duration = 1100;
			const tick = (now: number) => {
				const t = Math.min((now - start) / duration, 1);
				shown.value = format(target.value * (1 - Math.pow(1 - t, 3)));
				if (t < 1) requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		},
		{ threshold: 0.4 }
	);
});
</script>
