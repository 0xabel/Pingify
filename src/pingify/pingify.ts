import { ipcMain } from 'electron';
import store from '../main/store';
import axios from 'axios';
class Pingify {
	data: any; // Property declaration for 'data'
	config: any; // Property declaration for 'config'
	constructor() {
		this.data = this.getAppData(); // Initialize data from store or empty object
		this.setupIPCListeners(); // Setup IPC listeners
	}

	// Setup IPC event listeners
	private setupIPCListeners() {
		// Handle request for app data
		ipcMain.handle('get-app-data', (event, args) => {
			return this.getAppData();
		});

		// Handle setting app data
		ipcMain.on('set-app-data', (_event, data: any) => {
			this.setAppData(data);
		});

		// Handle deleting a task by index
		ipcMain.on('delete-task', (_event, id: string) => {
			this.deleteTask(id);
		});

		// Handle deleting all tasks
		ipcMain.on('delete-selected-tasks', (event, args) => {
			this.deleteSelectedTasks(args);
		});

		ipcMain.handle('get-proxy-ping', (event, id: string) => {
			return this.ping(id);
		});

		ipcMain.handle('start-selected-tasks', async (event, ids) => {
			return await this.startSelectedTasks(ids);
		});

		ipcMain.on('set-app-settings', (event, args) => {
			this.setAppSettings(args);
		});

		ipcMain.handle('get-app-settings', (event, args) => {
			return this.getSettings();
		});
	}
	async ping(id: string) {
		const data = this.getAppData();
		const { timeout } = this.getSettings();
		console.log(timeout);
		// Find the proxy with the provided id
		const proxyIndex = data.proxies.findIndex((p: any) => p.id === id);

		if (proxyIndex === -1) {
			throw new Error('Proxy not found');
		}

		const proxy: any = { ...data.proxies[proxyIndex] };
		const config = {
			url: proxy.url,
			proxy: {
				protocol: 'http',
				host: proxy.proxy.split(':')[0],
				port: parseInt(proxy.proxy.split(':')[1]),
			},
			headers: {
				'content-type': 'application/json',
			},
			method: 'GET',
			timeout,
		};

		try {
			const start = Date.now();
			const response = await axios(config);
			const end = Date.now();
			const ping = end - start;

			// Update the proxy's ping and status properties
			proxy.ping = ping;
			proxy.status = 'success';

			// Update the data object with the modified proxy
			const newData = [...data.proxies];
			newData[proxyIndex] = proxy;

			// Set the updated data object
			this.setAppData({ proxies: newData });

			return proxy;
		} catch (error) {
			// Handle the error for the specific proxy
			proxy.status = 'failed';
			proxy.ping = 0;
			const newData = [...data.proxies];
			newData[proxyIndex] = proxy;
			this.setAppData({ proxies: newData });

			console.log('Error', error);
			return proxy;
		}
	}

	async startSelectedTasks(ids: any) {
		const data = this.getAppData();

		const selectedProxies: any = data.proxies.filter((p: any) => {
			return ids.includes(p.id);
		});

		const results = await Promise.all(
			selectedProxies.map(async (proxy: any) => {
				try {
					return await this.ping(proxy.id);
				} catch (error) {
					console.error(`Failed to ping proxy ${proxy.id}: ${error}`);
					return null; // or handle error response as needed
				}
			}),
		);

		const updatedProxies = selectedProxies.map((proxy: any, index: number) => {
			if (results[index] !== null) {
				return results[index]; // Update proxy with ping result
			} else {
				return proxy; // Keep original proxy if ping failed
			}
		});

		const newData = {
			...data,
			proxies: data.proxies.map((p: any) => {
				const updatedProxy = updatedProxies.find(
					(updProxy: any) => updProxy.id === p.id,
				);
				return updatedProxy || p; // Use updated proxy if found, otherwise keep original
			}),
		};

		this.setAppData(newData);

		return results;
	}

	// Method to get app data
	getAppData() {
		return store.get('data') || { proxies: [] }; // Get data from store
	}

	// Method to set app data
	setAppData(data: any) {
		store.set('data', data); // Update data in store
	}

	deleteTask(id: string) {
		// Remove task from the data
		const data = this.getAppData();

		const filteredProxies = data.proxies.filter(
			(proxy: any) => proxy.id !== id,
		);

		this.data.proxies = filteredProxies;

		this.setAppData(this.data);
	}

	// Method to delete all tasks
	deleteSelectedTasks([...ids]: string[]) {
		const data = this.getAppData();
		// Remove tasks from the data
		const filteredProxies = data.proxies.filter(
			(proxy: any) => !ids.includes(proxy.id),
		);

		this.data.proxies = filteredProxies;

		this.setAppData(this.data);
	}

	getSettings() {
		return store.get('settings') || { name: '', timeout: 0 };
	}

	setAppSettings(data: any) {
		store.set('settings', data);
	}
}

export default Pingify;
