import { writable } from "svelte/store";
import { Archive, Area, Project, Resource } from "../para";


const PARAStore = writable<{
  project: Project;
  area: Area;
  resources: Resource;
  archives: Archive;
} | undefined>()


export { PARAStore }
