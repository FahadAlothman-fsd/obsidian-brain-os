import { TFolder, type App, TFile, TAbstractFile } from "obsidian";
import type { BrainSettings } from "../types";
import { createFile } from "./files";
import { PROJECT, AREA, SUB_AREA, RESOURCE } from "../constants";
import type { templateType } from "../stores";

export type createPARADataType = {
  entry_file: string;
  para_tag: string;
  folder_path: string;
  related_areas?: string[];
  related_templates?: templateType[]
}
export type PARATypes = typeof PROJECT | typeof AREA | typeof SUB_AREA | typeof RESOURCE
export type findPARAFileConditionsType = {
  tags: string[];
}

export function generateHeaderRegExp(header: string) {
  console.log(header)
  const formattedHeader = /^#+/.test(header.trim())
    ? header.trim()
    : `# ${header.trim()}`;
  const reg = new RegExp(`(${formattedHeader}[^\n]*)([\\s\\S]*?)(?=\\n##|$)`);

  return reg;
}

export const findParaFile = async (
  conditions: findPARAFileConditionsType,
  app: App,
  settings: BrainSettings,
  type: PARATypes) => {

  if (!app || !settings) {
    // TODO: add notice to indicate that the app or settings are not defined (only when debug mode is on)
    return;
  }
  let dir: string = ""
  // Setting root dir for searching
  switch (type) {

    case PROJECT: {

      dir = settings.para.projects.folder
      break;
    }
    case SUB_AREA:
    case AREA: {

      dir = settings.para.areas.folder
      break;
    }
    case RESOURCE: {
      dir = settings.para.resources.folder

    }
  }

  if (dir === "") return;

  const folder = app.vault.getAbstractFileByPath(dir);

  if (folder instanceof TFolder) {

    // DFS for all areas and sub-areas in the areas root folder
    const stack = [folder]
    const visited = new Set<TAbstractFile>()
    const result: TAbstractFile[] = []

    while (stack.length) {
      const vertex = stack.pop()

      if (vertex !== undefined) {
        if (!visited.has(vertex)) {
          visited.add(vertex)

          const { name } = vertex
          const indexFile = vertex.children.find((file) => {
            if ((file as TFile).basename === name) {
              return true;
            }
            if (file.path.match(/(.*\.)?README\.md/)) {
              return true;
            }
          });
          if (indexFile !== undefined) {
            result.push(indexFile)
          }

        }
        for (const neighbor of vertex.children.sort().filter((file) => file instanceof TFolder)) {
          stack.push(neighbor as TFolder);
        }
      }
    }

    const indexFile = result.find((file) => {

      // check if the tags inside the README match the tags given in conditions
      if (conditions.tags.length) {
        // const fileTags = this.tags(indexFile?.path || '');

        let fileTags: string[] = []
        if (file instanceof TFile) {
          const { frontmatter } = app.metadataCache.getFileCache(file) || {
            frontmatter: {},
          };

          let tags = frontmatter?.tags;

          if (!tags) {
            tags = [];
          }

          if (typeof tags === 'string') {
            tags = [tags];
          }

          fileTags = tags.map((tag: string) => tag.replace(/^#(.*)$/, '$1'));
          fileTags = tags
          console.log(fileTags)
        }

        // tags: #work/project-1 #work/project-2
        // condition.tags: #work
        console.log(fileTags, conditions.tags.map((tag: string) => tag.replace(/^#(.*)$/, '$1')))
        if (hasCommonPrefix(fileTags, conditions.tags.map((tag: string) => tag.replace(/^#(.*)$/, '$1')))) {
          return true;
        }
        // if (fileTags === conditions.tags) return true
      }
    })

    return indexFile?.parent?.name


  }
}


function hasCommonPrefix(tags1: string[], tags2: string[]) {
  // TODO: this approach doesnt work because of tags that start with the same letters
  // e.g. artificial & art.
  // a better approach might be:
  // - if you split the tags by the "/"
  // - compare the tags (the strings need to entirely match) then return if they match
  for (const tag1 of tags1) {
    for (const tag2 of tags2) {
      if (tag1.startsWith(tag2)) {
        return true;
      }
    }
  }
  return false;
}



export const createPARAFile = async (values: createPARADataType, app: App, settings: BrainSettings, type: PARATypes) => {
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
  if (type === AREA || type === SUB_AREA) {

    // TODO: for the sub-area, you should do the following:
    // - look if the tag before the sub-area's tag exists 
    // - look for a README file that has this parent tag and get the folder of parent area
    // - insert the parent folder at the beginning of the path 
    path = settings.para.areas.folder
    templateFile = settings.para.areas.template

  } else if (type === PROJECT) {
    path = settings.para.projects.folder
    templateFile = settings.para.projects.template
  } else if (type === RESOURCE) {
    path = settings.para.resources.folder
    templateFile = settings.para.resources.template
  }

  templateFile += ".md"


  const key = values.folder_path
  tag = values.para_tag
  INDEX = values.entry_file


  folder = `${path}/${key}`;
  file = `${folder}/${INDEX}`;

  let related_templates_section

  if (values.related_templates) {

    const templates = values.related_templates.map((template) => {

      const tempFile = app.vault.getFileByPath(template.path)
      console.log(tempFile)
      if (tempFile instanceof TFile) {
        const link = app.metadataCache.fileToLinktext(
          tempFile,
          tempFile?.path
        );
        console.log(`[[${link}|${tempFile.name}]]`)
        return `[[${link}|${tempFile.name}]]`;
      }
    })
      .filter((link) => !!link)
      .map((link) => `- ${link}`)

    if (templates.length > 0) {

      related_templates_section = [`# ${settings.otherTemplatesHeader} \n`, ...templates].join("\n")
    }
  }

  await createFile(app, {
    locale,
    templateFile,
    folder,
    file,
    tag,
    append: related_templates_section
  });
};
