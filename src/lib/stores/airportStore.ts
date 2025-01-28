import { writable } from 'svelte/store';

export interface AirportData {
	ident: string;
	latitude_deg: number;
	longitude_deg: number;
}

interface AirportStoreState {
	loading: boolean;
	error: string | null;
	data: Record<string, AirportData>;
}

export const airportStore = writable<AirportStoreState>({
	loading: true,
	error: null,
	data: {}
});

export const loadAirportsFromJSON = async (): Promise<void> => {
	airportStore.set({ loading: true, error: null, data: {} });
	try {
		const jsonPath = './airports.json';
		const response = await fetch(jsonPath);
		const jsonData = await response.json();
		const data: Record<string, AirportData> = {};
		jsonData.forEach((row: AirportData) => {
			data[row.ident] = {
				ident: row.ident,
				latitude_deg: row.latitude_deg,
				longitude_deg: row.longitude_deg
			};
		});

		airportStore.set({ loading: false, error: null, data });

	} catch (error) {
		airportStore.set({ loading: false, error: error.message, data: {} });
		console.error('Error loading airport data:', error);
	}
};