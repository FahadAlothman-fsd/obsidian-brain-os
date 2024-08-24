import {
  PARAStore, ProjectStore, ProjectEntryStore,
  AreaStore, AreaEntryStore, ResourceStore, ResourceEntryStore,
  ArchiveStore
} from './paraStore'
import { plugin, app, tags, dataviewStore } from './pluginStore'
import { default as periodicStore } from './periodicStore'
import { writable } from 'svelte/store'
import { App, TFile } from 'obsidian'
import type { BrainSettings } from '../types'
import { findTemplateFiles, getRelativePath } from '../utils'
import { tags as PARATags } from './tagStore'


type templateType = {
  name: string;
  extenstion: string;
  path: string;
  parent: {
    name: string;
    path: string;
  } | null
}



type brainOSTemplatesStoreType = {
  para: {
    project: TFile | undefined,
    area: TFile | undefined,
    resource: TFile | undefined,
  },
  periodic: {
    daily: TFile | undefined,
    weekly: TFile | undefined,
    monthly: TFile | undefined,
    quarterly: TFile | undefined,
    yearly: TFile | undefined,

  },
  otherTemplates: TFile[] | undefined,
}


const brainOSTemplatesStoreType = (() => {

  let _app: App
  let _settings: BrainSettings | undefined

  plugin.subscribe(($plugin) => {
    if ($plugin) {
      _app = $plugin.app
      _settings = $plugin.settings
    }

    if (_app && _settings) {
      loadAllTemplates(_app, _settings)
    }
  })



  const templatesStore = writable<brainOSTemplatesStoreType[] | []>([])


  function loadAllTemplates(app: App, settings: BrainSettings) {

    const para_templates = loadPARATemplates(app, settings)
    const periodic_templates = loadPeriodicTemplates(app, settings)
    const other_templates = loadOtherTemplates(app, settings)

    // templatesStore.set({
    //   : { ...para_templates },
    //   periodic: { ...periodic_templates },
    //
    // })


  }


  function loadPARATemplates(app: App, settings: BrainSettings) {

    const projectTemplate = app.vault.getFileByPath(settings.para.projects.template)
    const areaTemplate = app.vault.getFileByPath(settings.para.areas.template)
    const resourceTemplate = app.vault.getFileByPath(settings.para.resources.template)
    // TODO: archive will probably not need a template
    // const archiveTemplate = app.vault.getFileByPath(settings.para.archives.template)
    return {
      project: projectTemplate,
      area: areaTemplate,
      resource: resourceTemplate,
    }
  }


  function loadPeriodicTemplates(app: App, settings: BrainSettings) {

    const dailyTemplate = app.vault.getFileByPath(settings.periodic.daily.template)
    const weeklyTemplate = app.vault.getFileByPath(settings.periodic.weekly.template)
    const monthlyTemplate = app.vault.getFileByPath(settings.periodic.monthly.template)
    const quarterlyTemplate = app.vault.getFileByPath(settings.periodic.quarterly.template)
    const yearlyTemplate = app.vault.getFileByPath(settings.periodic.yearly.template)

    return {
      daily: dailyTemplate,
      weekly: weeklyTemplate,
      montly: monthlyTemplate,
      quarterly: quarterlyTemplate,
      yearlyTemplate: yearlyTemplate,
    }
  }



  async function loadOtherTemplates(app: App, settings: BrainSettings) {

    const files = findTemplateFiles(app, settings.otherTemplates)
    if (files) {
      const templates = files.sort().filter((val) => val instanceof TFile)
      return templates

    }
  }
})()

const templates = (() => {
  let _app: App
  let _settings: BrainSettings | undefined

  plugin.subscribe(($plugin) => {
    if ($plugin) {
      _app = $plugin.app
      _settings = $plugin.settings
    }

    if (_app && _settings) {
      loadTemplateFiles(_app, _settings)
    }
  })

  const { set, subscribe } = writable<templateType[] | []>([])

  function loadTemplateFiles(app: App, settings: BrainSettings) {

    const files = findTemplateFiles(app, settings.otherTemplates)
    if (files) {
      const templates = files.sort().filter((val) => val instanceof TFile)
      set(templates.map((file) => {
        if (file.parent) {
          return {
            name: getRelativePath(settings.otherTemplates, file.path),
            extenstion: file.extension,
            path: file.path,
            parent: {
              name: file.parent.name,
              path: file.parent.path

            }
          }
        } else {

          return {
            name: file.basename,
            extenstion: file.extension,
            path: file.path,
            parent: null
          }
        }
      }))
    }
  }


  return {
    subscribe,
    reload: () => {

      if (_app && _settings) {
        loadTemplateFiles(_app, _settings)
      }
    }

  }

})()

const areaStore = AreaStore()
const projectStore = ProjectStore(areaStore)
const resourceStore = ResourceStore()
const archiveStore = ArchiveStore(areaStore)

export {
  // Plugin
  plugin, app,
  tags as tagsStore,
  // Dataview
  dataviewStore,
  PARATags,
  // PARA
  PARAStore,
  projectStore, ProjectEntryStore,
  areaStore, AreaEntryStore,
  resourceStore, ResourceEntryStore,
  archiveStore,
  // Periodic
  periodicStore,
  // template
  templates as templateStore,
  type templateType,
}
