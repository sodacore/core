<template>
	<div id="application" :style="pageStyles">
		<div class="layout-item" v-for="area in page.layout.uniqueAreas" :key="area" :style="{ gridArea: area }">
			<template v-for="element in page.elements.filter((e: Record<string, any>) => e.area === area)" :key="JSON.stringify(element)">
				<component
					:is="getComponent(element.component)"
					:element="element"
				/>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { reactive } from 'vue';
	import Text from './components/Text.vue';

	// Get the page data.
	const response = await fetch('http://localhost:3101/ui/example');
	const data = await response.json();
	console.log(data);

	// Now convert the data to reactive.
	const page = reactive(data);

	// Define the page styles.
	const pageStyles = {
		'grid-template-columns': page.layout.columns,
		'grid-template-rows': page.layout.rows,
		'grid-template-areas': `"${page.layout.areas.map((a: string[]) => a.join(' ')).join('" "')}"`,
	};

	// Define the mapping.
	const componentTypes: Record<string, any> = {
		'text': Text,
	};

	// Get component method.
	const getComponent = (component: string) => {
		return componentTypes[component] ?? Text;
	};
</script>

<style lang="css" scoped>
	#application {
		display: grid;
		width: 100%;
		height: 100vh;
	}

	.layout-item {
		border: 1px solid black;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
