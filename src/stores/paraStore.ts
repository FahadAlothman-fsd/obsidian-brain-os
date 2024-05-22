import { writable } from "svelte/store";
import BrainOS from '../main'


const plugin = writable<BrainOS>();


export default { plugin }
