import { writable, derived } from "svelte/store";
import BrainOS from '../main'
import type { App } from 'obsidian';

const plugin = writable<BrainOS>();

const app = derived(plugin, ($plugin) => $plugin.app)


export default { plugin, app }
