import type { App } from "obsidian";
import type { BrainSettings } from "../types";
import { createFile } from "./files";

export type PARAType = {
  entry_file: string;
  para_tag: string;
  folder_path: string;
}

export const createPARAFile = async (values: PARAType, app: App, settings: BrainSettings, type: "Project" | "Area" | "Sub-Area") => {
  if (!app || !settings) {
    // TODO: add notice to indicate that the app or settings are not defined (only when debug mode is on)
    return;
  }

  const locale = window.localStorage.getItem('language') || 'en';
  let templateFile = '';
  let folder = '';
  let file = '';
  let tag = '';
  let INDEX = '';
  let path = '';
  if (type === "Area" || type === "Sub-Area") {

    // TODO: for the sub-area, you should do the following:
    // - look if the tag before the sub-area's tag exists 
    // - look for a README file that has this parent tag and get the folder of parent area
    // - insert the parent folder at the beginning of the path 
    path = settings.para.areas.folder
    templateFile = settings.para.areas.template

  } else {
    path = settings.para.projects.folder
    templateFile = settings.para.projects.template
  }

  templateFile += ".md"


  const key = values.folder_path
  tag = values.para_tag
  INDEX = values.entry_file


  folder = `${path}/${key}`;
  file = `${folder}/${INDEX}`;

  await createFile(app, {
    locale,
    templateFile,
    folder,
    file,
    tag,
  });
};
