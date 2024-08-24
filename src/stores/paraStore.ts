import { derived, get, writable } from "svelte/store";
import { Archive, Area, Project, Resource } from "../para";
import { TFile, App, TFolder, Vault, TAbstractFile } from "obsidian";
import type { BrainSettings } from "../types";
import type { AreaEntryType, ProjectEntryType, ResourceEntryType, ArchiveEntryType, ResourceEntryItemType, statusType, PARATypes, PARAType } from "../types/paraTypes";
import { dataviewStore, plugin } from "./pluginStore";
import { getParaREADMEFiles, isArrayOfStrings, Status } from "../utils";
import { templateStore, type templateType } from ".";
import { DataviewApi } from "obsidian-dataview";
import { AREA, PROJECT, RESOURCE, SUB_AREA } from "../constants";


const PARAStore = writable<{
  project: Project;
  area: Area;
  resources: Resource;
  archives: Archive;
} | undefined>()




// TODO: there should be a PARA store that does the following:
// - index the following aspects of each section of PARA:
//    - Project: project tag, related areas, folder name, README name, related templates, project status (dynamic), project priority (dyanmic)
//    - Area: area tag, related areas?, folder name, README name, related templates, area priority (dyanmic)
//    - Resource: resource tag, folder name, README name, related templates, resource progress (review, done, in progress, etc), all resources inside the said resource type 
//    - Archive: archived tag, folder name, README name, PARA type: (project, resource, area), also for resource there should be 

const ProjectEntryStore = writable<ProjectEntryType | undefined>();
const ProjectStore = (areaStore: ReturnType<typeof AreaStore>) => {

  let _app: App | undefined
  let _settings: BrainSettings | undefined
  let _templates: templateType[]
  let _dataview: DataviewApi
  let _vault: Vault
  let _areas: AreaEntryType[]

  dataviewStore.subscribe(($dataviewStore) => {
    if ($dataviewStore) {
      _dataview = $dataviewStore
    }
  })

  plugin.subscribe(($plugin) => {
    if ($plugin) {
      _app = $plugin.app
      _settings = $plugin.settings
      _vault = _app.vault
    }
  })

  templateStore.subscribe(($templateStore) => {
    if ($templateStore.length > 0) {
      _templates = $templateStore
    }
  })

  areaStore.subscribe(($area_entries) => {
    if ($area_entries && $area_entries.length > 0) {
      _areas = $area_entries
    }
  })

  const ProjectEntriesStore = writable<ProjectEntryType[]>([])

  function getEntryByTag(tag: string) {
    const prj_entires = get(ProjectEntriesStore)

    return prj_entires.find((entry) => entry.tag === tag)

  }

  function getEntryByTFile(file: TFile) {
    const prj_entires = get(ProjectEntriesStore)

    return prj_entires.find((entry) => entry.README === file)

  }

  function loadEntries() {

    if (_app && _settings && _areas) {

      const settings = _settings
      const app = _app
      const areas = _areas
      const projectREADMEs = getParaREADMEFiles(app, settings.para.projects.folder)

      if (projectREADMEs.length > 0) {
        const ProjectEntries = projectREADMEs.filter(file => file instanceof TFile).map((project_README) => {


          const projectEntry: ProjectEntryType = {
            tag: "",
            related_areas: [],
            related_templates: [],
            project_status: Status.makeDefault(settings, PROJECT),
            project_priority: "",
            README: project_README,
          }

          if (project_README.parent) {
            projectEntry.folder_name = project_README.parent
          }

          const file = app.metadataCache.getFileCache(project_README)

          if (file) {

            if (file.frontmatter) {

              if (file.frontmatter.hasOwnProperty('tags') && isArrayOfStrings(file.frontmatter['tags'])) {

                const tag = file.frontmatter['tags'].find((tag) => tag.startsWith(settings.para.areas.prefix))

                if (tag) {
                  projectEntry.tag = tag
                }
              }

              if (file.frontmatter.hasOwnProperty(settings.para.projects.status_frontmatter)) {

                const file_status: string = file.frontmatter[settings.para.projects.status_frontmatter]
                const stat: statusType | undefined = settings.para.projects.project_statuses.find((status) => status.id === file_status)
                if (stat) {

                  projectEntry.project_status = stat
                }

              }

              if (file.frontmatter.hasOwnProperty(settings.para.projects.priority_frontmatter)) {

                projectEntry.project_priority = file.frontmatter[settings.para.projects.priority_frontmatter]
              }


              if (file.frontmatter.hasOwnProperty(settings.para.projects.related_areas_frontmatter)
                && isArrayOfStrings(file.frontmatter[settings.para.projects.related_areas_frontmatter])) {
                // TODO: search the tag of each area in the related_areas frontmatter 
                // then find it then add it to the list of tags
                let related_areas: AreaEntryType[] = file.frontmatter[settings.para.projects.related_areas_frontmatter]
                  .map((area_tag: string) => areas.find((area_entry) => area_entry.tag === area_tag))
                  .filter((ar: AreaEntryType | undefined) => !!ar)

                projectEntry.related_areas = related_areas

              }


              if (file.frontmatter.hasOwnProperty(settings.other_templates_frontmatter) &&
                isArrayOfStrings(file.frontmatter[settings.other_templates_frontmatter])) {
                let templates = file.frontmatter[settings.other_templates_frontmatter].map((templateText: string) => {
                  const template_path = templateText.split("|")[0].substring(2)

                  const template = app.vault.getFileByPath(template_path)
                  if (template) {
                    return template
                  }
                })
                projectEntry.related_templates = templates

              }

              if (file.frontmatter.hasOwnProperty(settings.para.projects.deadline_frontmatter)) {
                // TODO: get the date from the deadline
                projectEntry.project_deadline = file.frontmatter[settings.para.projects.deadline_frontmatter]

              }

            }
          }

          return projectEntry
        })

        if (ProjectEntries.length > 0) {
          ProjectEntriesStore.set(ProjectEntries);
        }
      }
    }
  }

  function getEntries() {

    let project_entries: ProjectEntryType[] = []
    ProjectEntriesStore.subscribe((entries) => {
      if (entries.length > 0) {
        project_entries = entries
      }
    })

    return project_entries
  }

  return {
    subscribe: ProjectEntriesStore.subscribe,
    loadEntries,
    getEntryByTag,
    getEntryByTFile,
    getEntries
  }
}


const AreaEntryStore = writable<AreaEntryType | undefined>();
const AreaStore = () => {

  let _app: App | undefined
  let _settings: BrainSettings | undefined
  let _templates: templateType[]
  let _dataview: DataviewApi
  let _vault: Vault

  dataviewStore.subscribe(($dataviewStore) => {
    if ($dataviewStore) {

      _dataview = $dataviewStore

    }
  })

  plugin.subscribe(($plugin) => {
    if ($plugin) {
      _app = $plugin.app
      _settings = $plugin.settings
      _vault = _app.vault
    }
  })

  templateStore.subscribe(($templateStore) => {
    if ($templateStore.length > 0) {
      _templates = $templateStore
    }
  })

  const AreaEntiresStore = writable<AreaEntryType[]>([])


  function getEntryByTFile(file: TFile) {
    const area_entires = get(AreaEntiresStore)

    return area_entires.find((entry) => entry.README === file)

  }

  function getEntryByTag(tag: string) {
    const area_entires = get(AreaEntiresStore)

    return area_entires.find((entry) => entry.tag === tag)

  }


  function loadEntries() {

    if (_app && _settings) {

      const settings = _settings
      const app = _app
      const areaREADMEs = getParaREADMEFiles(app, settings.para.areas.folder)

      if (areaREADMEs.length > 0) {
        const AreaEntries = areaREADMEs.filter(file => file instanceof TFile).map((area_README) => {


          const areaEntry: AreaEntryType = {
            tag: "",
            // related_areas: [],
            related_templates: [],
            // project_status: "",
            area_priority: "",
            README: area_README,
            type: AREA
          }

          if (area_README.parent) {
            areaEntry.folder_name = area_README.parent
          }

          const file = app.metadataCache.getFileCache(area_README)

          if (file) {

            if (file.frontmatter) {

              if (file.frontmatter.hasOwnProperty('tags') && isArrayOfStrings(file.frontmatter['tags'])) {
                // TODO: double check if the para tag is the last tag inserted or the first (i think its the last)
                // you could check also if the name matches either the README or the parent folder for any clues 

                const tag = file.frontmatter['tags'].find((tag) => tag.startsWith(settings.para.areas.prefix))

                if (tag) {
                  areaEntry.tag = tag
                }
              }

              // TODO: Add area status (for archiving purporses) in the settings
              //
              // if (file.frontmatter.hasOwnProperty(settings.para.projects.status_frontmatter)) {
              //
              //   prj.project_status = file.frontmatter[settings.para.projects.status_frontmatter]
              //
              // }

              if (file.frontmatter.hasOwnProperty(settings.para.areas.priority_frontmatter)) {

                areaEntry.area_priority = file.frontmatter[settings.para.areas.priority_frontmatter]
              }



              if (file.frontmatter.hasOwnProperty(settings.other_templates_frontmatter) &&
                isArrayOfStrings(file.frontmatter[settings.other_templates_frontmatter])) {

                let templates = file.frontmatter[settings.other_templates_frontmatter].map((templateText: string) => {
                  const template_path = templateText.split("|")[0].substring(2)
                  const template = app.vault.getFileByPath(template_path)
                  if (template) {
                    return template
                  }
                })
                areaEntry.related_templates = templates


              }


            }
          }

          return areaEntry
        })

        if (AreaEntries.length > 0) {
          AreaEntiresStore.set(AreaEntries);
        }
      }
    }
  }


  function getEntries() {

    let area_entries: AreaEntryType[] = []
    AreaEntiresStore.subscribe((entries) => {
      if (entries.length > 0) {
        area_entries = entries
      }
    })

    return area_entries
  }

  return {
    subscribe: AreaEntiresStore.subscribe,
    loadEntries,
    getEntryByTag,
    getEntries,
    getEntryByTFile,
  }
}

const ResourceEntryStore = writable<ResourceEntryType | undefined>();
const ResourceStore = () => {

  let _app: App | undefined
  let _settings: BrainSettings | undefined
  let _templates: templateType[]
  let _dataview: DataviewApi
  let _vault: Vault

  dataviewStore.subscribe(($dataviewStore) => {
    if ($dataviewStore) {

      _dataview = $dataviewStore

    }
  })

  plugin.subscribe(($plugin) => {
    if ($plugin) {
      _app = $plugin.app
      _settings = $plugin.settings
      _vault = _app.vault
    }
  })

  templateStore.subscribe(($templateStore) => {
    if ($templateStore.length > 0) {
      _templates = $templateStore
    }
  })

  const ResourceEntiresStore = writable<ResourceEntryType[]>([])


  function getEntryByTFile(file: TFile) {
    const resource_entires = get(ResourceEntiresStore)

    return resource_entires.find((entry) => entry.README === file)

  }

  function getEntryByTag(tag: string) {
    const resource_entires = get(ResourceEntiresStore)

    return resource_entires.find((entry) => entry.tag === tag)

  }


  function loadEntries() {

    if (_app && _settings) {

      const settings = _settings
      const app = _app
      const resourceREADMEs = getParaREADMEFiles(app, settings.para.resources.folder)

      if (resourceREADMEs.length > 0) {
        const ResourceEntries = resourceREADMEs.filter(file => file instanceof TFile).map((resource_README, _, array) => {

          if (!array.some(val => val !== resource_README && val.parent && resource_README.path.startsWith(val.parent.path))) {


            const resourceEntry: ResourceEntryType = {
              tag: "",
              related_templates: [],
              README: resource_README,
              resources: []
            }

            if (resource_README.parent) {
              resourceEntry.folder_name = resource_README.parent

              resourceEntry.folder_name.children.forEach((resource_item) => {



                // if its a regular file (does not contain README), do the following:
                // - check that the parent is the root EntryItem

                if (resource_item instanceof TFile && resourceEntry.folder_name === resource_item.parent && resourceEntry.README !== resource_item) {
                  const file = app.metadataCache.getFileCache(resource_item)
                  if (file?.frontmatter && file.frontmatter.hasOwnProperty(settings.para.resources.status_frontmatter)) {

                    // - the file attribute will be this file
                    // - the status attribute will be the status in the frontmatter of the file
                    resourceEntry.resources?.push({
                      file: resource_item,
                      status: file.frontmatter[settings.para.resources.status_frontmatter]
                    })
                  }
                }

                if (resource_item instanceof TFolder) {
                  console.log("found folder")

                  const entryFile = resource_item.children.find((val) => val instanceof TFile && val.path.match(/(.*\.)README\.md/)) as TFile
                  let resourceItem: ResourceEntryItemType | undefined

                  // if its a README file, check the parent folder name, make sure it doesnt match the folder of the resource entry
                  if (entryFile && entryFile.parent !== resourceEntry.folder_name) {

                    const file = app.metadataCache.getFileCache(entryFile)
                    if (file && file.frontmatter && file.frontmatter.hasOwnProperty(settings.para.resources.status_frontmatter)) {
                      resourceItem = {
                        file: entryFile,
                        status: file.frontmatter[settings.para.resources.status_frontmatter],
                        folder: resource_item,
                        files: []
                      }
                      //    - the folder will be the folder attribute in ResourceEntryItem

                      //    - iterate over the files inside the folder, look for a README file that will be the file attribute and the status will be there 
                      //    - all other files will be in the files attribute
                      //    - if there are other folders inside the root ResourceEntryItem, iterate over it then put the files inside the files attribute
                      const stack = [resource_item]
                      const visited = new Set<TAbstractFile>()
                      const result: TFile[] = []


                      while (stack.length > 0) {
                        const vertex = stack.pop()

                        if (vertex !== undefined) {
                          if (!visited.has(vertex)) {
                            visited.add(vertex)


                            if (vertex.children.length > 0) {
                              const Resource = vertex.children.sort().filter((file) => {
                                if (file instanceof TFile) {

                                  if (file.path.match(/^(?!.*\.README\.md$).*\.md$/)) {
                                    return true

                                  }
                                }
                              }) as TFile[];

                              if (Resource) {
                                result.push(...Resource)
                              }

                            }
                            for (const neighbor of vertex.children.sort().filter((file) => file instanceof TFolder)) {
                              stack.push(neighbor as TFolder);
                            }
                          }
                        }
                      }

                      if (result.length > 0) {

                        if (resourceItem && resourceItem.files) {

                          resourceItem.files.push(...result)
                        }

                      }
                      console.log("adding to resources", resourceItem)
                      resourceEntry.resources?.push(resourceItem)
                      console.log(resourceEntry.resources)
                    }

                  }

                }

              })
            }

            const file = app.metadataCache.getFileCache(resource_README)

            if (file) {

              if (file.frontmatter) {

                if (file.frontmatter.hasOwnProperty('tags') && isArrayOfStrings(file.frontmatter['tags'])) {
                  const tag = file.frontmatter['tags'].find((tag) => tag.startsWith(settings.para.resources.prefix))
                  if (tag) {
                    resourceEntry.tag = tag
                  }
                }





                if (file.frontmatter.hasOwnProperty(settings.other_templates_frontmatter) && isArrayOfStrings(file.frontmatter[settings.other_templates_frontmatter])) {

                  let templates = file.frontmatter[settings.other_templates_frontmatter].map((templateText: string) => {
                    const template_path = templateText.split("|")[0].substring(2)
                    const template = app.vault.getFileByPath(template_path)
                    if (template) {
                      return template
                    }
                  })
                  resourceEntry.related_templates = templates

                }


              }
            }

            console.log(resourceEntry)
            return resourceEntry
          }
        }).filter((val => !!val))

        if (ResourceEntries.length > 0) {
          ResourceEntiresStore.set(ResourceEntries);
        }
      }
    }
  }


  function getEntries() {

    let resource_entries: ResourceEntryType[] = []
    ResourceEntiresStore.subscribe((entries) => {
      if (entries.length > 0) {
        resource_entries = entries
      }
    })


    return resource_entries
  }

  return {
    subscribe: ResourceEntiresStore.subscribe,
    loadEntries,
    getEntryByTag,
    getEntryByTFile,
    getEntries
  }
}

const ArchiveStore = (areaStore: ReturnType<typeof AreaStore>) => {
  {

    let _app: App | undefined
    let _settings: BrainSettings | undefined
    let _templates: templateType[]
    let _dataview: DataviewApi
    let _vault: Vault
    let _areas: AreaEntryType[]

    dataviewStore.subscribe(($dataviewStore) => {
      if ($dataviewStore) {

        _dataview = $dataviewStore

      }
    })

    plugin.subscribe(($plugin) => {
      if ($plugin) {
        _app = $plugin.app
        _settings = $plugin.settings
        _vault = _app.vault
      }
    })

    templateStore.subscribe(($templateStore) => {
      if ($templateStore.length > 0) {
        _templates = $templateStore
      }
    })

    areaStore.subscribe(($area_entries) => {
      if ($area_entries && $area_entries.length > 0) {
        _areas = $area_entries
      }
    })

    const ArchiveEntiresStore = writable<ArchiveEntryType>({
      archived_projects: [],
      archived_areas: [],
      archived_resources: []
    })


    function getEntryByTFile(file: TFile, type: PARATypes) {
      const archived_entires = get(ArchiveEntiresStore)

      switch (type) {
        case PROJECT:
          return archived_entires.archived_projects.find((entry) => entry.README === file)
        case AREA:
          return archived_entires.archived_areas.find((entry) => entry.README === file)
        case RESOURCE:
          return archived_entires.archived_resources.find((entry) => entry.README === file)
      }


    }

    function getEntryByTag(tag: string, type: PARATypes) {
      const archived_entires = get(ArchiveEntiresStore)

      switch (type) {
        case PROJECT:
          return archived_entires.archived_projects.find((entry) => entry.tag === tag)
        case AREA:
          return archived_entires.archived_areas.find((entry) => entry.tag === tag)
        case RESOURCE:
          return archived_entires.archived_resources.find((entry) => entry.tag === tag)
      }

    }


    function loadEntries() {

      if (_app && _settings) {

        const settings = _settings
        const app = _app
        const projectREADMEs = getParaREADMEFiles(app, `${settings.para.archives.folder}/${PROJECT}`)
        const areaREADMEs = getParaREADMEFiles(app, `${settings.para.archives.folder}/${AREA}`)
        const resourceREADMEs = getParaREADMEFiles(app, `${settings.para.archives.folder}/${RESOURCE}`)


        if (areaREADMEs.length > 0) {
          const AreaEntries = areaREADMEs.filter(file => file instanceof TFile).map((area_README) => {


            const areaEntry: AreaEntryType = {
              tag: "",
              // related_areas: [],
              related_templates: [],
              // project_status: "",
              area_priority: "",
              README: area_README,
              type: AREA
            }

            if (area_README.parent) {
              areaEntry.folder_name = area_README.parent
            }

            const file = app.metadataCache.getFileCache(area_README)

            if (file) {

              if (file.frontmatter) {

                if (file.frontmatter.hasOwnProperty('tags') && isArrayOfStrings(file.frontmatter['tags'])) {
                  // TODO: double check if the para tag is the last tag inserted or the first (i think its the last)
                  // you could check also if the name matches either the README or the parent folder for any clues 
                  const tag = file.frontmatter['tags'].find((tag) => tag.startsWith(settings.para.areas.prefix))

                  if (tag) {
                    areaEntry.tag = tag
                  }
                }

                // TODO: Add area status (for archiving purporses) in the settings
                //
                // if (file.frontmatter.hasOwnProperty(settings.para.projects.status_frontmatter)) {
                //
                //   prj.project_status = file.frontmatter[settings.para.projects.status_frontmatter]
                //
                // }

                if (file.frontmatter.hasOwnProperty(settings.para.areas.priority_frontmatter)) {

                  areaEntry.area_priority = file.frontmatter[settings.para.areas.priority_frontmatter]
                }



                if (file.frontmatter.hasOwnProperty(settings.other_templates_frontmatter) &&
                  isArrayOfStrings(file.frontmatter[settings.other_templates_frontmatter])) {

                  let templates = file.frontmatter[settings.other_templates_frontmatter].map((templateText: string) => {
                    const template_path = templateText.split("|")[0].substring(2)
                    const template = app.vault.getFileByPath(template_path)
                    if (template) {
                      return template
                    }
                  })
                  areaEntry.related_templates = templates


                }


              }
            }

            return areaEntry
          })

          if (AreaEntries.length > 0) {
            ArchiveEntiresStore.update((curr) => {

              return {
                ...curr,
                archived_areas: AreaEntries
              }
            });
          }
        }
        if (projectREADMEs.length > 0) {
          const ProjectEntries = projectREADMEs.filter(file => file instanceof TFile).map((project_README) => {


            const projectEntry: ProjectEntryType = {
              tag: "",
              related_areas: [],
              related_templates: [],
              project_status: Status.makeDefault(settings, PROJECT),
              project_priority: "",
              README: project_README,
            }

            if (project_README.parent) {
              projectEntry.folder_name = project_README.parent
            }

            const file = app.metadataCache.getFileCache(project_README)

            if (file) {

              if (file.frontmatter) {

                if (file.frontmatter.hasOwnProperty('tags') && isArrayOfStrings(file.frontmatter['tags'])) {
                  // TODO: double check if the para tag is the last tag inserted or the first (i think its the last)
                  // you could check also if the name matches either the README or the parent folder for any clues 
                  const tag = file.frontmatter['tags'].find((tag) => tag.startsWith(settings.para.areas.prefix))

                  if (tag) {
                    projectEntry.tag = tag
                  }
                }

                if (file.frontmatter.hasOwnProperty(settings.para.projects.status_frontmatter)) {

                  const file_status: string = file.frontmatter[settings.para.projects.status_frontmatter]
                  const stat: statusType | undefined = settings.para.projects.project_statuses.find((status) => status.name === file_status)
                  if (stat) {

                    projectEntry.project_status = stat
                  }

                }

                if (file.frontmatter.hasOwnProperty(settings.para.projects.priority_frontmatter)) {

                  projectEntry.project_priority = file.frontmatter[settings.para.projects.priority_frontmatter]
                }


                if (file.frontmatter.hasOwnProperty(settings.para.projects.related_areas_frontmatter)
                  && isArrayOfStrings(file.frontmatter[settings.para.projects.related_areas_frontmatter])) {
                  // TODO: search the tag of each area in the related_areas frontmatter 
                  // then find it then add it to the list of tags
                  let areas: AreaEntryType[] = file.frontmatter[settings.para.projects.related_areas_frontmatter]
                    .map((area_tag: string) => _areas.find((area_entry) => area_entry.tag === area_tag))
                    .filter((ar: AreaEntryType | undefined) => !!ar)

                  projectEntry.related_areas = areas

                }


                if (file.frontmatter.hasOwnProperty(settings.other_templates_frontmatter) &&
                  isArrayOfStrings(file.frontmatter[settings.other_templates_frontmatter])) {
                  let templates = file.frontmatter[settings.other_templates_frontmatter].map((templateText: string) => {
                    const template_path = templateText.split("|")[0].substring(2)

                    const template = app.vault.getFileByPath(template_path)
                    if (template) {
                      return template
                    }
                  })
                  projectEntry.related_templates = templates

                }

                if (file.frontmatter.hasOwnProperty(settings.para.projects.deadline_frontmatter)) {
                  // TODO: get the date from the deadline
                  projectEntry.project_deadline = file.frontmatter[settings.para.projects.deadline_frontmatter]

                }

              }
            }

            return projectEntry
          })

          if (ProjectEntries.length > 0) {
            ArchiveEntiresStore.update((curr) => {

              return {
                ...curr,
                archived_projects: ProjectEntries
              }
            });
          }
        }
        if (resourceREADMEs.length > 0) {
          const ResourceEntries = resourceREADMEs.filter(file => file instanceof TFile).map((resource_README, _, array) => {

            if (!array.some(val => val !== resource_README && val.parent && resource_README.path.startsWith(val.parent.path))) {


              const resourceEntry: ResourceEntryType = {
                tag: "",
                related_templates: [],
                README: resource_README,
                resources: []
              }

              if (resource_README.parent) {
                resourceEntry.folder_name = resource_README.parent

                resourceEntry.folder_name.children.forEach((resource_item) => {



                  // if its a regular file (does not contain README), do the following:
                  // - check that the parent is the root EntryItem

                  if (resource_item instanceof TFile && resourceEntry.folder_name === resource_item.parent && resourceEntry.README !== resource_item) {
                    const file = app.metadataCache.getFileCache(resource_item)
                    if (file?.frontmatter && file.frontmatter.hasOwnProperty(settings.para.resources.status_frontmatter)) {

                      // - the file attribute will be this file
                      // - the status attribute will be the status in the frontmatter of the file
                      resourceEntry.resources?.push({
                        file: resource_item,
                        status: file.frontmatter[settings.para.resources.status_frontmatter]
                      })
                    }
                  }

                  if (resource_item instanceof TFolder) {

                    const entryFile = resource_item.children.find((val) => val instanceof TFile && val.path.match(/(.*\.)README\.md/)) as TFile
                    let resourceItem: ResourceEntryItemType | undefined

                    // if its a README file, check the parent folder name, make sure it doesnt match the folder of the resource entry
                    if (entryFile && entryFile.parent !== resourceEntry.folder_name) {

                      const file = app.metadataCache.getFileCache(entryFile)
                      if (file && file.frontmatter && file.frontmatter.hasOwnProperty(settings.para.resources.status_frontmatter)) {
                        resourceItem = {
                          file: entryFile,
                          status: file.frontmatter[settings.para.resources.status_frontmatter],
                          folder: resource_item,
                          files: []
                        }
                        //    - the folder will be the folder attribute in ResourceEntryItem

                        //    - iterate over the files inside the folder, look for a README file that will be the file attribute and the status will be there 
                        //    - all other files will be in the files attribute
                        //    - if there are other folders inside the root ResourceEntryItem, iterate over it then put the files inside the files attribute
                        const stack = [resource_item]
                        const visited = new Set<TAbstractFile>()
                        const result: TFile[] = []


                        while (stack.length > 0) {
                          const vertex = stack.pop()

                          if (vertex !== undefined) {
                            if (!visited.has(vertex)) {
                              visited.add(vertex)


                              if (vertex.children.length > 0) {
                                const Resource = vertex.children.sort().filter((file) => {
                                  if (file instanceof TFile) {

                                    if (file.path.match(/^(?!.*\.README\.md$).*\.md$/)) {
                                      return true

                                    }
                                  }
                                }) as TFile[];

                                if (Resource) {
                                  result.push(...Resource)
                                }

                              }
                              for (const neighbor of vertex.children.sort().filter((file) => file instanceof TFolder)) {
                                stack.push(neighbor as TFolder);
                              }
                            }
                          }
                        }

                        if (result.length > 0) {

                          if (resourceItem && resourceItem.files) {

                            resourceItem.files.push(...result)
                          }

                        }
                        resourceEntry.resources?.push(resourceItem)
                      }

                    }

                  }

                })
              }

              const file = app.metadataCache.getFileCache(resource_README)

              if (file) {

                if (file.frontmatter) {

                  if (file.frontmatter.hasOwnProperty('tags') && isArrayOfStrings(file.frontmatter['tags'])) {
                    const tag = file.frontmatter['tags'].find((tag) => tag.startsWith(settings.para.resources.prefix))

                    if (tag) {
                      resourceEntry.tag = tag
                    }
                  }





                  if (file.frontmatter.hasOwnProperty(settings.other_templates_frontmatter) && isArrayOfStrings(file.frontmatter[settings.other_templates_frontmatter])) {

                    let templates = file.frontmatter[settings.other_templates_frontmatter].map((templateText: string) => {
                      const template_path = templateText.split("|")[0].substring(2)
                      const template = app.vault.getFileByPath(template_path)
                      if (template) {
                        return template
                      }
                    })
                    resourceEntry.related_templates = templates

                  }


                }
              }

              return resourceEntry
            }
          }).filter((val => !!val))

          if (ResourceEntries.length > 0) {
            ArchiveEntiresStore.update((curr) => {

              return {
                ...curr,
                archived_resources: ResourceEntries
              }
            });
          }
        }
      }
    }


    function getEntries(type: PARATypes) {

      let archived_entries: ProjectEntryType[] | AreaEntryType[] | ResourceEntryType[] = []
      ArchiveEntiresStore.subscribe((entries) => {
        switch (type) {
          case PROJECT:
            archived_entries = entries.archived_projects
            break;
          case AREA:
            archived_entries = entries.archived_areas
            break;
          case RESOURCE:
            archived_entries = entries.archived_resources
            break;
        }
      })

      return archived_entries
    }

    return {
      subscribe: ArchiveEntiresStore.subscribe,
      loadEntries,
      getEntryByTag,
      getEntryByTFile,
      getEntries,
    }
  }
}

export {
  PARAStore,
  ProjectStore, ProjectEntryStore,
  AreaStore, AreaEntryStore,
  ResourceStore, ResourceEntryStore,
  ArchiveStore,
}
