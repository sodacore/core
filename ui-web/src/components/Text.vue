<template>
	<p
		v-bind="element.attributes"
		:class="element.classes"
		:style="element.styles"
	>
		{{ element.value }}
	</p>
</template>

<script setup lang="ts">
	defineProps<{
		element: Record<string, any>,
	}>();
</script>
