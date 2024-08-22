import { TFolder, type App, TFile, TAbstractFile, Notice } from "obsidian";
import type { BrainSettings } from "../types";
import { createFile, getRelativePath } from "./files";
import { PROJECT, AREA, SUB_AREA, RESOURCE, ERROR_MESSAGE } from "../constants";
import type { templateType } from "../stores";
import { I18N_MAP } from "../i18n";
import { areaStore, plugin, templateStore } from "../stores";
import { get } from "svelte/store";
import type { field } from "svelte-forms";

export type createPARADataType = {
  entry_file: string;
  para_tag: string;
  folder_path: string;
  related_areas?: string[];
  related_templates?: TagComboInputType[]
  deadline?: string;
  priority?: number;
  status?: string;
}
export type PARATypes = typeof PROJECT | typeof AREA | typeof SUB_AREA | typeof RESOURCE
export type findPARAFileConditionsType = {
  tags: string[];
}

type TagComboInputType = {
  id: string; // will be used as the thing to retrieve the information the consumer of this componenet wants
  name: string;
  sub_title: string;
};

export function filterTags(
  touchedInput: boolean,
  inputValue: string,
  tags: { id: string; value: string }[],
  prohibited_tag: string | undefined,
): TagComboInputType[] {
  const areas = get(areaStore);
  return touchedInput
    ? areas
      .filter((val) => {
        return (
          !tags.some((tag) => tag.id === val.tag) &&
          val.tag !== prohibited_tag
        );
      })
      .filter(({ tag }) => {
        const normalizedInput = inputValue.toLowerCase();
        return tag.toLowerCase().includes(normalizedInput);
      })
      .map((val) => {

        const brainOS = get(plugin)
        let areaName = val.tag
        if (brainOS) {
          areaName = val.tag.substring(brainOS.settings.para.areas.prefix.length)
        }
        return {
          id: val.tag,
          name: areaName,
          sub_title: val.area_priority,
        }
      })
    : areas
      .filter((val) => {
        return (
          !tags.some((tag) => tag.id === val.tag) &&
          val.tag !== prohibited_tag
        );
      })
      .map((val) => {
        const brainOS = get(plugin)
        let areaName = val.tag
        if (brainOS) {
          areaName = val.tag.substring(brainOS.settings.para.areas.prefix.length)
        }
        return {
          id: val.tag,
          name: areaName,
          sub_title: val.area_priority,
        }
      })
      .sort((a, b) => {
        if (parseInt(a.sub_title) && parseInt(b.sub_title)) {
          return parseInt(a.sub_title) - parseInt(b.sub_title)
        }
        return 0
      })
};



export function filterTemplates(
  touchedInput: boolean,
  inputValue: string,
  tags: { id: string; value: string }[],
  prohibited_tag: string | undefined,
): TagComboInputType[] {

  const templates = get(templateStore);
  return touchedInput
    ? templates
      .filter((val) => {
        return (
          !tags.some((tag) => tag.id === val.path)

        );
      })
      .filter(({ name }) => {
        const normalizedInput = inputValue.toLowerCase();
        return name.toLowerCase().includes(normalizedInput);
      })
      .map((val) => ({
        id: val.path,
        name: val.name,
        sub_title: val.parent?.name || "",
      }))
    : templates
      .filter((val) => {
        return (
          !tags.some((tag) => tag.id === val.path)

        );
      })
      .map((val) => ({
        id: val.path,
        name: val.name,
        sub_title: val.parent?.name || "",
      }));
}




export function addTagToInput(
  tag: string,
  form_field: ReturnType<typeof field<TagComboInputType[]>>,
): { id: string; value: string } | undefined {
  const brainOS = get(plugin);
  if (brainOS) {
    const area = areaStore.getEntryByTag(tag);
    if (area) {
      const input_field_values = get(form_field).value;
      form_field.set([
        ...input_field_values,
        {
          id: area.tag,
          name: area.tag.substring(brainOS.settings.para.areas.prefix.length),
          sub_title: area.area_priority,
        },
      ]);
    }
    return {
      id: tag,
      value: tag.substring(brainOS.settings.para.areas.prefix.length),
    };
  }
};

export function removeTagFromInput(tag: string, form_field: ReturnType<typeof field<TagComboInputType[]>>): void {
  const brainOS = get(plugin);
  if (brainOS) {
    const area = areaStore.getEntryByTag(tag);
    if (area) {
      const input_field_values = get(form_field).value;
      form_field.set(input_field_values.filter((val) => val.id !== area.tag));
    }
  }
};



export function addTemplateToInput(
  tag: string,
  form_field: ReturnType<typeof field<TagComboInputType[]>>,
): { id: string; value: string } | undefined {
  const templates = get(templateStore);

  const template = templates.find((temp) => temp.path === tag);
  const brainOS = get(plugin)
  console.log(tag)
  let value = tag
  if (brainOS) {
    value = getRelativePath(brainOS.settings.otherTemplates, tag)
    console.log(tag)
    if (template) {
      const input_field_values = get(form_field).value;
      form_field.set([
        ...input_field_values,
        {
          id: template.path,
          name: template.name,
          sub_title: template.parent?.name || "",
        },
      ]);
    }
  }
  return {
    id: tag,
    value: value,
  };
};

export function removeTemplateFromInput(tag: string, form_field: ReturnType<typeof field<TagComboInputType[]>>): void {
  const templates = get(templateStore);

  const brainOS = get(plugin);
  if (brainOS) {
    const template = templates.find((temp) => temp.path === tag);
    if (template) {
      const input_field_values = get(form_field).value;
      form_field.set(input_field_values.filter((val) => val.id !== template.path));
    }
  }
};

export function getParaREADMEFiles(
  app: App,
  dir: string
) {

  const locale = window.moment().locale()

  if (!app) {
    // TODO: add notice to indicate that the app or settings are not defined (only when debug mode is on)
    new Notice(
      I18N_MAP[locale][`${ERROR_MESSAGE}NO_APP_EXIST`],
    );
    return [];
  }

  if (dir === "") {

    // TODO: add notice to indicate that the app or settings are not defined (only when debug mode is on)
    new Notice(
      I18N_MAP[locale][`${ERROR_MESSAGE}NO_DIR_EXIST`],
    );
    return [];
  }

  const folder = app.vault.getAbstractFileByPath(dir);

  if (folder instanceof TFolder) {

    // DFS for all PARA in the PARA folder specified in the dir
    const stack = [folder]
    const visited = new Set<TAbstractFile>()
    const result: TAbstractFile[] = []

    while (stack.length > 0) {
      const vertex = stack.pop()

      if (vertex !== undefined) {
        if (!visited.has(vertex)) {
          visited.add(vertex)


          if (vertex.children.length > 0) {
            const TemplateFile = vertex.children.sort().filter((file) => {
              if (file instanceof TFile) {

                if (file.path.match(/(.*\.)README\.md/)) {
                  return true;
                }
              }
            });
            if (TemplateFile) {
              result.push(...TemplateFile)
            }

          }
          for (const neighbor of vertex.children.sort().filter((file) => file instanceof TFolder)) {
            stack.push(neighbor as TFolder);
          }
        }
      }
    }

    if (result.length === 0) {
      new Notice(
        I18N_MAP[locale][`${ERROR_MESSAGE}NO_PARA_ENTRIES`] + dir,
      );

      return result
    }

    return result


  }
  return []
}

export function generateHeaderRegExp(header: string) {
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
        }

        // tags: #work/project-1 #work/project-2
        // condition.tags: #work
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

  const locale = window.localStorage.getItem('language') || 'en';
  if (!app || !settings) {
    // TODO: add notice to indicate that the app or settings are not defined (only when debug mode is on)
    new Notice(
      I18N_MAP[locale][`${ERROR_MESSAGE}NO_APP_EXIST`],
    )
    return;
  }

  let metadata: { tags: string[] } & Record<string, string | number | string[]> = { tags: [values.para_tag.replace(/^#/, "")] }
  let templateFile = '';
  let folder = '';
  let file = '';
  let INDEX = '';
  let path = '';
  if (type === AREA || type === SUB_AREA) {

    // TODO: for the sub-area, you should do the following:
    // - look if the tag before the sub-area's tag exists 
    // - look for a README file that has this parent tag and get the folder of parent area
    // - insert the parent folder at the beginning of the path 
    path = settings.para.areas.folder
    templateFile = settings.para.areas.template

    if (values.priority) {
      metadata[settings.para.areas.priority_frontmatter] = values.priority
    }
    if (type === SUB_AREA) {

      const parent_folder = values.para_tag.split("/").slice(0, -1)
      path = `${path}/${parent_folder.map((val, index) =>
        index === 0 ? val.substring(settings.para.areas.prefix.length) : val).join("/")}`
    }

  } else if (type === PROJECT) {
    path = settings.para.projects.folder
    templateFile = settings.para.projects.template

    if (values.deadline) {
      metadata[settings.para.projects.deadline_frontmatter] = values.deadline
    }

    if (values.priority) {
      // TODO: if the priority exists then knock the lower priority projects down (e.g. 1 -> 2, 2 -> 3 ,etc)
      metadata[settings.para.projects.priority_frontmatter] = values.priority
    }

    if (values.status) {
      // TODO: get all the statuses from settings and check if the value of the status 
      // if it doesn't exist, Notice and return error
      metadata[settings.para.projects.status_frontmatter] = values.status
    }

    if (values.related_areas) {
      metadata[settings.para.projects.related_areas_frontmatter] = values.related_areas
    }

  } else if (type === RESOURCE) {
    path = settings.para.resources.folder
    templateFile = settings.para.resources.template
  }

  templateFile += ".md"


  const key = values.folder_path
  // tag = values.para_tag
  INDEX = values.entry_file

  if (values.related_areas) {
    metadata.related_areas = values.related_areas
  }

  folder = `${path}/${key}`;
  file = `${folder}/${INDEX}`;


  if (values.related_templates) {

    const templates = values.related_templates.map((template) => {

      const tempFile = app.vault.getFileByPath(template.id)
      if (tempFile instanceof TFile) {
        // const link = app.metadataCache.fileToLinktext(
        //   tempFile,
        //   tempFile.path
        // );
        return `[[${tempFile.path}|${tempFile.name}]]`;
      }
    })
      .filter((link) => link !== undefined)

    if (templates && templates.length > 0) {

      metadata[settings.other_templates_frontmatter] = templates
    }
  }


  const createdFile = await createFile(app, {
    locale,
    templateFile,
    folder,
    file,
    metadata,
  });
  if (createdFile instanceof TFile) {
    return createdFile

  }

};
