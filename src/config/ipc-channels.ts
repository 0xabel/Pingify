// Whitelist channels for IPC
export type Channels = string;

// Main -> Renderer
const APP_UPDATED = 'app-updated';
const APP_NOTIFICATION = 'app-notification'; // to display a notification using the OS notification system

const PRELOAD_SOUNDS = 'preload-sounds';
const PLAY_SOUND = 'play-sound';

// Renderer -> Main
const GET_APP_INFO = 'get-app-info';
const GET_APP_PATHS = 'get-app-paths';
const GET_RENDERER_SYNC = 'get-renderer-sync';

const SET_KEYBIND = 'set-keybind';
const SET_SETTINGS = 'set-settings';

const RENDERER_READY = 'renderer-ready';

const TRIGGER_APP_MENU_ITEM_BY_ID = 'trigger-app-menu-item-by-id';
const OPEN_URL = 'open-url';

const GET_APP_DATA = 'get-app-data';
const SET_APP_DATA = 'set-app-data';
const DELETE_TASK = 'delete-task';
const DELETE_SELECTED_TASKS = 'delete-selected-tasks';

const GET_PROXY_PING = 'get-proxy-ping';
const PING_STATUS = 'ping-status';
const START_SELECTED_TASKS = 'start-selected-tasks';

const SET_APP_SETTINGS = 'set-app-settings';
const GET_APP_SETTINGS = 'get-app-settings';

export const ipcChannels = {
	// main -> renderer
	APP_NOTIFICATION,
	APP_UPDATED,
	PRELOAD_SOUNDS,
	PLAY_SOUND,

	// renderer -> main
	RENDERER_READY,
	GET_RENDERER_SYNC,
	GET_APP_INFO,
	GET_APP_PATHS,

	SET_KEYBIND,
	SET_SETTINGS,

	TRIGGER_APP_MENU_ITEM_BY_ID,
	OPEN_URL,
	GET_APP_DATA,
	SET_APP_DATA,
	DELETE_TASK,
	DELETE_SELECTED_TASKS,

	GET_PROXY_PING,
	PING_STATUS,
	START_SELECTED_TASKS,
	SET_APP_SETTINGS,
	GET_APP_SETTINGS,
};
