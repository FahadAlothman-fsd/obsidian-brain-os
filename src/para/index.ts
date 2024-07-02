import { Project } from "./Project";
import { Area } from "./Area";
import { Resource } from "./Resource";
import { Archive } from "./Archive";
import { PROJECT, AREA, SUB_AREA, RESOURCE } from "../constants";
// import { Tag } from "../utils/tag";
import type { BrainSettings } from "../types";


type PARATypes = typeof PROJECT | typeof AREA | typeof SUB_AREA | typeof RESOURCE


function getParaType(settings: BrainSettings, tag: string): PARATypes | undefined {

  const prefixes: { prefix: string; type: PARATypes }[] = [
    { prefix: settings.para.projects.prefix, type: PROJECT },
    { prefix: settings.para.areas.prefix, type: AREA },
    { prefix: settings.para.resources.prefix, type: RESOURCE },
  ]
  return prefixes.find((value) => tag.startsWith(value.prefix))?.type
}

// class PARATag extends Tag {
//   ParaType: PARATypes
//   constructor(name: string, type: PARATypes) {
//     super(name)
//     this.ParaType = type
//   }
//
// }



export {
  // PARATag,
  getParaType,
  Project,
  Area,
  Resource,
  Archive,
}

export type {
  PARATypes,
}
