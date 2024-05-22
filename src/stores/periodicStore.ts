import { writable } from "svelte/store";
import BrainOS from '../main'


const periodic = writable<BrainOS>();


export default { periodic }
