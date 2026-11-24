<template>
	<UTooltip
		:text="text"
		:content="{ side: 'top' }"
		:ui="{ content: 'h-auto max-w-72 py-2 whitespace-normal' }"
	>
		<UBadge
			color="primary"
			variant="outline"
			size="sm"
			tabindex="0"
			class="cursor-help"
			>Anachron</UBadge
		>
	</UTooltip>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), {
	text: 'Ran on the legacy backend behavior (anachron), which loads code written for an older Drupal core on Drupal 11.'
});
</script>
