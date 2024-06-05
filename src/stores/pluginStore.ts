import { writable, derived } from "svelte/store";
import BrainOS from '../main'
import type { App } from 'obsidian';
import type { Tag } from "../types";

const plugin = writable<BrainOS>();

const app = derived(plugin, ($plugin) => $plugin.app)

const tags = writable<Tag[]>([])


export { plugin, app, tags }
