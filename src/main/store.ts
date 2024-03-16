import { CustomAcceleratorsType } from '@/types/keyboard';
import Store from 'electron-store';
import {
	DEFAULT_KEYBINDS,
	DEFAULT_SETTINGS,
	SettingsType,
} from '../config/settings';

export type AppMessageType = string;

export type AppMessageLogType = AppMessageType[];

interface ProxyType {
	ping: number;
	status: 'pending' | 'testing' | 'success' | 'failed' | 'timeout';
	proxy: string;
}

export interface StoreType {
	settings: SettingsType;
	appMessageLog: AppMessageLogType; // Public-facing console.log()
	keybinds: CustomAcceleratorsType; // Custom keybinds/accelerators/global shortcuts
	data: {
		proxies: ProxyType[];
		url: string;
	};
}

const schema: Store.Schema<StoreType> = {
	appMessageLog: {
		type: 'array',
		default: [],
	},
	keybinds: {
		type: 'object',
		properties: {
			quit: {
				type: 'string',
			},
			reset: {
				type: 'string',
			},
		},
		default: DEFAULT_KEYBINDS,
	},
	settings: {
		type: 'object',
		properties: {
			timeout: {
				type: ['number', 'null'],
			},
			name: {
				type: ['string', 'null'],
			},
			default: {},
		},
	},
	data: {
		type: 'object',
		properties: {
			proxies: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						ping: {
							type: ['number', 'null'],
						},
						status: {
							type: 'string',
							enum: ['pending', 'testing', 'success', 'failed', 'timeout'],
						},
						proxy: {
							type: 'string',
						},
						id: {
							type: 'string',
						},
						url: {
							type: 'string',
						},
					},
				},
				default: [],
			},
		},
	},
};

const store = new Store<StoreType>({ schema });

export default store;
