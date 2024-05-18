import { writable } from "svelte/store";
import ObsidianNoteConnections from '../main'


const periodic = writable<ObsidianNoteConnections>();


export default { periodic }
