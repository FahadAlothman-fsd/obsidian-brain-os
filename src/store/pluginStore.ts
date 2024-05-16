import { writable, derived } from "svelte/store";
import ObsidianNoteConnections from '../main'
import type { App } from 'obsidian';

const plugin = writable<ObsidianNoteConnections>();

const app = derived(plugin, ($plugin) => $plugin.app)


export default { plugin, app }
