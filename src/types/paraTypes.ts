import type { TFile, TFolder } from "obsidian";
import type { StatusConfiguration, StatusType } from "../utils";
import type { PROJECT, AREA, RESOURCE } from "../constants";



export type PARATypes = typeof PROJECT | typeof AREA | typeof RESOURCE
export type AreaEntryType = {
  tag: string;
  related_templates: TFile[] // TODO: should be the same type of what the getAllTemplates func returns
  area_priority: string;
  README: TFile;
  folder_name?: TFolder;
}

export type ProjectEntryType = {
  tag: string;
  related_areas: AreaEntryType[];
  folder_name?: TFolder;
  related_templates: TFile[]; // TODO: should be the same type of what the getAllTemplates func return
  README: TFile;
  project_status: statusType; // TODO: make it dynamic set by the settings, same as in tasks plugin
  project_priority: string;
  project_deadline?: string; // TODO: should be of type Date with format taken from settings 
}

export type ResourceEntryType = {
  tag: string;
  folder_name?: TFolder;
  related_templates: TFile[] // TODO: should be the same type of what the getAllTemplates func return
  README: TFile;
  resources?: ResourceEntryItemType[]; // TODO: should be an array of all the resources inside the resource type (the type will be determined later)
}

// TODO: a resource can come in the following 
// - A single file that contains the highlights, notes, and tags of the resource
// - A folder (this is for dev docs generally, might be useful for other resource types) that contains files for each section of the related resource
// for folder the status will be tracked in the README of that resource
// for single files, it will be in the file
export type ResourceEntryItemType = {
  file: TFile;
  folder?: TFolder;
  files?: TFile[];
  status: StatusType;
}

export type ArchiveEntryType = {
  archived_projects: ProjectEntryType[];
  archived_areas: AreaEntryType[];
  archived_resources: ResourceEntryType[];
}

export type statusType = {
  id: string;
  name: string;
  type: StatusType;
  default?: boolean;
}


export type PARAType = {
  // templatePath: string; // should make sure its a path
  // projectsPath: string; // should be a path 
  // areasPath: string; // should be a path
  // resourcesPath: string; //should be a path

  usePARANotes: boolean;
  projects: {
    template: string; // README.md file
    folder: string; // should be path
    prefix: string; // should be regex
    status_frontmatter: string;
    priority_frontmatter: string;
    related_areas_frontmatter: string;
    related_templates_frontmatter: string;
    deadline_frontmatter: string;
    project_statuses: statusType[];
  }
  areas: {
    template: string; // README.md file
    folder: string; // should be path
    prefix: string; // should be regex
    priority_frontmatter: string;
    related_templates_frontmatter: string;
  }
  resources: {
    template: string; // README.md file
    folder: string; // should be path
    prefix: string; // should be regex
    related_templates_frontmatter: string;
    status_frontmatter: string;
    resource_statuses: statusType[];
  }
  archives: {
    template: string; // README.md file
    folder: string; // should be path
  }
}

