import { writable } from "svelte/store";
import ObsidianNoteConnections from '../main'


const plugin = writable<ObsidianNoteConnections>();


export default { plugin }
