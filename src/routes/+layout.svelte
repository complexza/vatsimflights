<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import Pilots from './pilots/+page.svelte';
	import Map from './map/+page.svelte';
	import { vatsimData, fetchVatsimData } from '$lib/stores/vatsim';

	onMount(() => {
		fetchVatsimData();
	});
</script>

<ModeWatcher />

<div class="relative flex h-screen">
	<aside class="w-[30%] overflow-y-auto bg-gray-100 p-4 dark:bg-zinc-900">
		<Pilots />
	</aside>

	<main class="relative flex-1">
		<Map />
	</main>
</div>