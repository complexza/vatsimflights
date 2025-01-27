<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { onMount } from 'svelte';
	import { vatsimData, fetchVatsimData } from '$lib/stores/vatsim';

	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import ArrowBigDown from 'lucide-svelte/icons/arrow-big-down';
	import { toggleMode, mode } from 'mode-watcher';
	import { Description } from '$lib/components/ui/alert';

	let loading = true;
	let searchTerm = '';
	let pilots = [];
	let controllers = [];
	let filteredPilots = [];
	let filteredControllers = [];

	let currentPage = 1;
	const itemsPerPage = 10;

	$: totalPagesPilots = Math.ceil(filteredPilots.length / itemsPerPage);
	$: totalPagesControllers = Math.ceil(filteredControllers.length / itemsPerPage);

	$: paginatedPilots = filteredPilots.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	$: paginatedControllers = filteredControllers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	onMount(async () => {
		await fetchVatsimData();
		pilots = $vatsimData.pilots.sort((a, b) => a.callsign.localeCompare(b.callsign));
		controllers = $vatsimData.controllers.sort((a, b) => a.callsign.localeCompare(b.callsign));
		filteredPilots = pilots;
		filteredControllers = controllers;
		loading = false;
	});

	$: filteredPilots = pilots.filter((pilot) =>
		pilot.callsign.toLowerCase().includes(searchTerm.toLowerCase())
	);

	$: filteredControllers = controllers.filter((controller) =>
		controller.callsign.toLowerCase().includes(searchTerm.toLowerCase())
	);

	function changePage(newPage) {
		currentPage = Math.max(1, Math.min(newPage, Math.max(totalPagesPilots, totalPagesControllers)));
	}

	function copyToClipboard(text) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				console.log('Copied to clipboard:', text);
			})
			.catch((err) => {
				console.error('Failed to copy:', err);
			});
	}
</script>

<Card.Root class="mb-4">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Vatsim Flights</Card.Title>
			<Button on:click={toggleMode} variant="outline" size="icon">
        {#if $mode == 'dark'}
				<Sun
					class="h-[1.2rem] w-[1.2rem] transition-all"
				/>
        {:else}
				<Moon
					class="h-[1.2rem] w-[1.2rem] transition-all"
				/>
        {/if}
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
		<Card.Description>
			Track VATSIM flights, pilots, and controllers in real-time. View flight plans, monitor virtual traffic, and enhance situational awareness with this comprehensive VATSIM tracker."
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col items-start gap-2">
			<div>Current Pilots Online: {pilots.length}</div>
			<div>Current Controllers Online: {controllers.length}</div>
		</div>
	</Card.Content>
</Card.Root>

<Tabs.Root value="pilots">
	<Tabs.List>
		<Tabs.Trigger value="pilots">Pilots</Tabs.Trigger>
		<Tabs.Trigger value="controllers">Controllers</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="pilots">
		<div class="mb-4">
			<input
				type="text"
				placeholder="Search Pilots by Callsign"
				bind:value={searchTerm}
				class="w-full rounded border p-2"
			/>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Callsign</Table.Head>
					<Table.Head>Altitude</Table.Head>
					<Table.Head>Departure</Table.Head>
					<Table.Head>Arrival</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					<Table.Row>
						<Table.Cell colspan="4" class="text-center">Loading Data...</Table.Cell>
					</Table.Row>
				{:else if paginatedPilots.length > 0}
					{#each paginatedPilots as pilot}
						<Table.Row>
							<Table.Cell>{pilot.callsign}</Table.Cell>
							<Table.Cell>{pilot.altitude}</Table.Cell>
							<Table.Cell>{pilot.departure}</Table.Cell>
							<Table.Cell>{pilot.arrival}</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="outline" size="sm">
											{#if $mode == 'dark'}
												<ArrowBigDown
													class="absolute h-[0.8rem] w-[0.8rem] text-zinc-50 transition-all"
												/>
											{:else}
												<ArrowBigDown
													class="absolute h-[0.8rem] w-[0.8rem] text-zinc-900 transition-all"
												/>
											{/if}
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Label>Actions</DropdownMenu.Label>
											<DropdownMenu.Separator />
											<DropdownMenu.Item on:click={() => copyToClipboard(pilot.route)}
												>Copy Flightplan</DropdownMenu.Item
											>
											<DropdownMenu.Item
												href={`https://skyvector.com/?chart=flight&fpl=${pilot.departure} ${pilot.arrival}`}
												target="_blank"
												rel="noopener noreferrer">View Skyvector</DropdownMenu.Item
											>
											<DropdownMenu.Item
												href={`https://stats.vatsim.net/stats/${pilot.cid}`}
												target="_blank"
												rel="noopener noreferrer">View Profile</DropdownMenu.Item
											>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell colspan="4" class="text-center">No Pilots Found</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
		<div class="mt-4 flex items-center justify-between">
			<Button on:click={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
				Previous
			</Button>
			<span>Page {currentPage} of {totalPagesPilots}</span>
			<Button
				on:click={() => changePage(currentPage + 1)}
				disabled={currentPage === totalPagesPilots}
			>
				Next
			</Button>
		</div>
	</Tabs.Content>
	<Tabs.Content value="controllers">
		<div class="mb-4">
			<input
				type="text"
				placeholder="Search Controllers by Callsign"
				bind:value={searchTerm}
				class="w-full rounded border p-2"
			/>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Callsign</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Frequency</Table.Head>
					<Table.Head>Facility</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					<Table.Row>
						<Table.Cell colspan="4" class="text-center">Loading Data...</Table.Cell>
					</Table.Row>
				{:else if paginatedControllers.length > 0}
					{#each paginatedControllers as controller}
						<Table.Row>
							<Table.Cell>{controller.callsign}</Table.Cell>
							<Table.Cell>{controller.name}</Table.Cell>
							<Table.Cell>{controller.frequency}</Table.Cell>
							<Table.Cell>{controller.facility}</Table.Cell>
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell colspan="4" class="text-center">No Controllers Found</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
		<div class="mt-4 flex items-center justify-between">
			<Button on:click={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
				Previous
			</Button>
			<span>Page {currentPage} of {totalPagesControllers}</span>
			<Button
				on:click={() => changePage(currentPage + 1)}
				disabled={currentPage === totalPagesControllers}
			>
				Next
			</Button>
		</div>
	</Tabs.Content>
</Tabs.Root>