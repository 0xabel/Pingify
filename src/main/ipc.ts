import { Menu, app, ipcMain, shell } from 'electron';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from '../config/settings';
import { CustomAcceleratorsType } from '../types/keyboard';
import { getOS } from '../utils/getOS';
import kb from './keyboard';
import { notification } from './notifications';
import { rendererPaths } from './paths';
import sounds from './sounds';
import { idle } from './startup';
import {
	getAppMessages,
	getKeybinds,
	getSettings,
	setSettings,
} from './store-actions';
import { is } from './util';
import Pingify from '../pingify/pingify';

export default {
	initialize() {
		// Activate the idle state when the renderer process is ready
		ipcMain.once(ipcChannels.RENDERER_READY, () => {
			idle();
		});

		// This is called ONCE, don't use it for anything that changes
		ipcMain.handle(ipcChannels.GET_APP_INFO, () => {
			const os = getOS();
			return {
				name: app.getName(),
				version: app.getVersion(),
				os,
				isMac: os === 'mac',
				isWindows: os === 'windows',
				isLinux: os === 'linux',
				isDev: is.debug,
				paths: rendererPaths,
			};
		});

		// These send data back to the renderer process
		ipcMain.handle(ipcChannels.GET_RENDERER_SYNC, () => {
			return {
				settings: getSettings(),
				keybinds: getKeybinds(),
				messages: getAppMessages(),
			};
		});

		// These do not send data back to the renderer process
		ipcMain.on(
			ipcChannels.SET_KEYBIND,
			(_event, keybind: keyof CustomAcceleratorsType, accelerator: string) => {
				kb.setKeybind(keybind, accelerator);
			},
		);

		ipcMain.on(
			ipcChannels.SET_SETTINGS,
			(_event, settings: Partial<SettingsType>) => {
				setSettings(settings);
			},
		);

		// Show a notification
		ipcMain.on(ipcChannels.APP_NOTIFICATION, (_event, options: any) => {
			notification(options);
		});

		// Play a sound
		ipcMain.on(ipcChannels.PLAY_SOUND, (_event: any, sound: string) => {
			sounds.play(sound);
		});

		// Open a URL in the default browser
		ipcMain.on(ipcChannels.OPEN_URL, (_event: any, url: string) => {
			shell.openExternal(url);
		});

		this.pingify();
	},

	// Listen for data requests from the renderer proces
	pingify() {
		const ping = new Pingify();
	},
};
