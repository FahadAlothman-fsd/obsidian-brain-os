import { PARAStore } from './paraStore'
import { plugin, app, tags } from './pluginStore'
import { default as periodicStore } from './periodicStore'
import { derived, writable } from 'svelte/store'
import { type TAbstractFile, App, type MetadataCache, TFile } from 'obsidian'
import type { BrainSettings } from '../types'
import { findTemplateFiles } from '../utils'


type templateType = {
  name: string;
  extenstion: string;
  path: string;
  parent: {
    name: string;
    path: string;
  } | null
}

const templates = (() => {
  let _app: App
  let _metaCache: MetadataCache | undefined
  let _settings: BrainSettings | undefined
  app.subscribe(($app) => {
    if ($app) {
      _app = $app
      _metaCache = $app.metadataCache
    }
    if (_app && _settings) {
      loadTemplateFiles(_app, _settings)
    }
  })
  plugin.subscribe(($plugin) => {
    if ($plugin) {
      _settings = $plugin.settings
    }

    if (_app && _settings) {
      loadTemplateFiles(_app, _settings)
    }
  })

  const { set, subscribe } = writable<templateType[] | []>([])

  function loadTemplateFiles(app: App, settings: BrainSettings) {

    findTemplateFiles(app, settings.otherTemplates).then((value) => {
      console.log(value)
      if (value) {
        const files = value.sort().filter((val) => val instanceof TFile)
        set(files.map((file) => {
          if (file.parent) {
            return {
              name: file.basename,
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
    }, (reason) => {

      console.log(reason)
    })
  }


  return {
    subscribe,
    reload: () => {

      console.log(_app, _settings)
      if (_app && _settings) {
        loadTemplateFiles(_app, _settings)
      }
    }

  }

})()

export {
  plugin, app, tags as tagsStore,
  templates as templateStore,
  PARAStore,
  periodicStore,
  type templateType,
}
