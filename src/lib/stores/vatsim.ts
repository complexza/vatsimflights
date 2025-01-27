import { writable } from 'svelte/store';
import axios from 'axios';

export interface Pilot {
	callsign: string;
	altitude: string | number;
	heading: string | number;
	departure: string;
	arrival: string;
	position: [number, number];
	name: string;
	cid: number;
	route: string;
}

export interface Controller {
	name: string;
	callsign: string;
	frequency: string;
	facility: string;
}

interface VatsimDataState {
	pilots: Pilot[];
	controllers: Controller[];
	loading: boolean;
	error: string | null;
}

export const vatsimData = writable<VatsimDataState>({
	pilots: [],
	controllers: [],
	loading: true,
	error: null
});

export const fetchVatsimData = async (): Promise<void> => {
	vatsimData.set({
		pilots: [],
		controllers: [],
		loading: true,
		error: null
	});

	try {
		const response = await axios.get('https://data.vatsim.net/v3/vatsim-data.json');

		const pilots = response.data.pilots.map(
			(pilot: any): Pilot => ({
				callsign: pilot.callsign || 'N/A',
				altitude: pilot.altitude || 'N/A',
				heading: pilot.heading || 'N/A',
				departure: pilot.flight_plan?.departure || 'N/A',
				arrival: pilot.flight_plan?.arrival || 'N/A',
				position: [pilot.latitude, pilot.longitude],
				name: pilot.name || 'N/A',
				cid: pilot.cid || 'N/A',
				route: pilot.flight_plan?.route || 'N/A'
			})
		);

		const controllers = response.data.controllers.map(
			(controller: any): Controller => ({
				name: controller.name || 'N/A',
				callsign: controller.callsign || 'N/A',
				frequency: controller.frequency || 'N/A',
				facility: controller.facility || 'N/A'
			})
		);

		vatsimData.set({
			pilots,
			controllers,
			loading: false,
			error: null
		});
	} catch (error) {
		vatsimData.set({
			pilots: [],
			controllers: [],
			loading: false,
			error: 'Failed to fetch VATSIM data'
		});
		console.error('Error fetching VATSIM data:', error);
	}
};
