<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { vatsimData, fetchVatsimData } from '$lib/stores/vatsim';
	import { mode } from 'mode-watcher';

	let map, tileLayerLight, tileLayerDark;
	let L;
	let loading = true;

	onMount(async () => {
		if (typeof window !== 'undefined') {
			const leaflet = await import('leaflet');
			L = leaflet.default;

			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			document.head.appendChild(link);

			await fetchVatsimData();

			loading = false;

			map = L.map('map').setView([51.505, -0.09], 3);

			tileLayerLight = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			});
			tileLayerDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
				subdomains: 'abcd'
			});

			tileLayerLight.addTo(map);

			const renderMarkers = () => {
				map.eachLayer((layer) => {
					if (layer instanceof L.Marker) {
						map.removeLayer(layer);
					}
				});

				get(vatsimData).pilots.forEach((pilot) => {
					if (pilot.position) {
						const planeIcon = L.divIcon({
							className: 'plane-icon',
							html: `
							<div style="transform: rotate(${pilot.heading || 0}deg);">
								<img src="${
									get(mode) === 'dark'
										? 'https://img.icons8.com/ios-filled/50/FFFFFF/airplane-mode-on.png'
										: 'https://img.icons8.com/ios-filled/50/000000/airplane-mode-on.png'
								}" style="width: 10px; height: 10px;" />
							</div>
							`,
							iconSize: [20, 20],
							iconAnchor: [10, 10],
							popupAnchor: [0, -10]
						});

						L.marker(pilot.position, { icon: planeIcon }).addTo(map).bindPopup(`
							<strong>${pilot.callsign}</strong><br />
							Name: ${pilot.name} <br />
							Altitude: ${pilot.altitude} ft<br />
							Departure: ${pilot.departure}<br />
							Arrival: ${pilot.arrival}
						`);
					}
				});
			};

			renderMarkers();

			const unsubscribe = mode.subscribe((currentMode) => {
				if (currentMode === 'dark') {
					map.removeLayer(tileLayerLight);
					tileLayerDark.addTo(map);
				} else {
					map.removeLayer(tileLayerDark);
					tileLayerLight.addTo(map);
				}

				renderMarkers();
			});

			return () => {
				unsubscribe();
				if (map) map.remove();
			};
		}
	});
</script>

<div class="relative h-full w-full">
	{#if loading}
	  <div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 z-10">
		<div class="loader"></div>
	  </div>
	{/if}
	<div id="map" class="h-full w-full"></div>
</div>

<style>
	.loader {
	  border: 4px solid #f3f3f3;
	  border-top: 4px solid #181818;
	  border-radius: 50%;
	  width: 40px;
	  height: 40px;
	  animation: spin 1s linear infinite;
	}
  
	@keyframes spin {
	  0% {
		transform: rotate(0deg);
	  }
	  100% {
		transform: rotate(360deg);
	  }
	}
  </style>