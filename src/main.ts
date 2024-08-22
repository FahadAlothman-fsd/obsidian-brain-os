import { Plugin, setIcon, TFolder, TFile } from "obsidian";
import type {
  App,
  MarkdownPostProcessorContext,
  PluginManifest,
} from 'obsidian';
import "virtual:uno.css";
// import { getAPI, isPluginEnabled, DataviewApi } from 'obsidian-dataview';
import {
  PeriodicView, PERIODIC_VIEW,
  ParaView, PARA_VIEW,
  MediaConsumptionView, MEDIA_CONSUMPTION_VIEW,
  IntegratorView, INTEGRATOR_VIEW
} from "./views";
import { File } from "./files";
import {
  // Plugin
  plugin, tagsStore,
  // Templates
  templateStore,
  // PARA
  PARAStore,
  projectStore, ProjectEntryStore,
  areaStore, AreaEntryStore,
  resourceStore, ResourceEntryStore,
  archiveStore,
} from './stores';
import { LogLevel, type BrainSettings } from "./types";
import { addNewOptionsToUserSettings, DEFAULT_SETTINGS, SettingTab } from "./SettingsTab";
import { logMessage, renderError } from "./utils";
import { I18N_MAP } from "./i18n";
import { ERROR_MESSAGE } from "./constants";
// import { dataviewStore } from "./stores/pluginStore";
// import { Project, Area, Resource, Archive } from "./para";
import { Bullet, Task, Date } from "./periodic";
import { SelectPARAType } from "./modals";
import { get } from "svelte/store";
import { SelectPARAToArchiveType } from "./modals/para/ArchivePARAModal";



export default class BrainOS extends Plugin {
  settings!: BrainSettings;
  // dataview!: DataviewApi;
  locale: string;
  codeBlockViews!: Record<string, any>;
  // project!: Project;
  // area!: Area;
  // resource!: Resource;
  // archive!: Archive;
  // task!: Task;
  // file!: File;
  // bullet!: Bullet;
  // date!: Date;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.locale = window.moment().locale()
    // if (!isPluginEnabled(app)) {
    //   logMessage(
    //     I18N_MAP[this.locale][`${ERROR_MESSAGE}NO_DATAVIEW_INSTALL`],
    //     LogLevel.error
    //   );
    //   return;
    // }
    //
    // const dataviewApi = getAPI(app) as DataviewApi;
    //
    // if (!dataviewApi) {
    //   logMessage(
    //     I18N_MAP[this.locale][`${ERROR_MESSAGE}FAILED_DATAVIEW_API`],
    //     LogLevel.error
    //   );
    //   return;
    // }

    this.app = app;

    // dataviewStore.set(dataviewApi)
    // this.dataview = dataviewApi;
  }
  async loadSettings() {
    const data = await this.loadData()
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

    if (data !== null && Object.entries(data).length !== 0) {
      this.settings = JSON.parse(JSON.stringify(data))
    }
    // TODO: find a better way to iterate over the settings and fill them
    // - maybe something to do with object keys and iterating over each key
    // - checking if there are any other objects inside

    // PARA
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.para.areas, this.settings.para.areas)
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.para.archives, this.settings.para.archives)
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.para.projects, this.settings.para.projects)
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.para.resources, this.settings.para.resources)
    // Periodic
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.periodic.daily, this.settings.periodic.daily)
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.periodic.weekly, this.settings.periodic.weekly)
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.periodic.monthly, this.settings.periodic.monthly)
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.periodic.quarterly, this.settings.periodic.quarterly)
    addNewOptionsToUserSettings(DEFAULT_SETTINGS.periodic.yearly, this.settings.periodic.yearly)

    await this.saveData(this.settings)

  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.loadStores()
    this.setupBrainOSCommands()
    // this.loadHelpers()
    // await this.initCodeBlockViews()
    // this.loadGlobalHelpers()
    // this.setupCodeBlocks()

  }

  async onload() {
    await this.loadSettings();

    // this.loadHelpers()
    // await this.initCodeBlockViews()
    // this.loadGlobalHelpers()
    // this.setupCodeBlocks()



    this.app.workspace.onLayoutReady(async () => {


      await this.setupBrainOSViews()

      await this.loadStores()

      // this.plugins.getPlugin("nldates-obsidian")
      // console.log(this.app.plugins.enabledPlugin.has('para-periodic'))
      this.setupBrainOSCommands()
      this.addSettingTab(new SettingTab(this.app, this));
      this.setupBrainOSEvents()

    })
  }

  onunload() {
    console.log("unloading plugin");
  }

  async loadStores() {
    plugin.set(this);
    tagsStore.reload();
    templateStore.reload()
    areaStore.loadEntries()
    projectStore.loadEntries()
    resourceStore.loadEntries()
    archiveStore.loadEntries()
  }


  setupBrainOSEvents() {

    if (this.settings.para.usePARANotes) {
      this.app.workspace.on('file-open', (file) => {
        if (file?.path.contains(".README.md")) {
          if (file.path.contains(this.settings.para.projects.folder)) {
            projectStore.loadEntries()
            ProjectEntryStore.set(projectStore.getEntryByTFile(file))
          } else if (file.path.contains(this.settings.para.areas.folder)) {
            areaStore.loadEntries()
            AreaEntryStore.set(areaStore.getEntryByTFile(file))
          } else if (file.path.contains(this.settings.para.resources.folder)) {
            resourceStore.loadEntries()
            ResourceEntryStore.set(resourceStore.getEntryByTFile(file))
          } else if (file.path.contains(this.settings.para.archives.folder)) {
            archiveStore.loadEntries()
          }
        } else if (get(ProjectEntryStore)) {
          ProjectEntryStore.set(undefined)
        } else if (get(AreaEntryStore)) {
          AreaEntryStore.set(undefined)
        } else if (get(ResourceEntryStore)) {
          ResourceEntryStore.set(undefined)
        }

      })

      // this.app.vault.on('create', (file) => {
      //   if (file instanceof TFolder) {
      //   }
      // })



    }
  }

  async setupBrainOSViews() {



    if (this.settings.para.usePARANotes) {
      this.registerView(PARA_VIEW, (leaf) => new ParaView(leaf));
      this.addRibbonIcon("infinity", "BOS: PARA view", () => {
        this.activateParaView();
      });
    }

    if (this.settings.periodic.usePeriodicNotes) {
      this.registerView(PERIODIC_VIEW, (leaf) => new PeriodicView(leaf));

      this.addRibbonIcon("calendar-clock", "BOS: Periodic view", () => {
        this.activatePeriodicView();
      });
    }

    this.registerView(MEDIA_CONSUMPTION_VIEW, (leaf) => new MediaConsumptionView(leaf));

    this.addRibbonIcon("book-marked", "BOS: Media view", () => {
      this.activateMediaView();
    });


    this.registerView(INTEGRATOR_VIEW, (leaf) => new IntegratorView(leaf));

    this.addRibbonIcon("shapes", "BOS: Integrator view", () => {
      this.activateIntegratorView();
    });


  }


  setupBrainOSCommands() {

    if (this.settings.para.usePARANotes) {
      this.activatePARACommands()

    }


  }

  // loadHelpers() {
  //   this.task = new Task(this.app, this.settings, this.dataview, this.locale);
  //   this.file = new File(this.app, this.settings, this.dataview, this.locale);
  //   this.date = new Date(this.app, this.settings, this.file, this.locale);
  //   this.bullet = new Bullet(this.app, this.settings, this.dataview, this.locale);
  //
  //   this.project = new Project(
  //     this.settings.para.projects.folder,
  //     this.app,
  //     this.settings,
  //     this.file,
  //     this.locale
  //   );
  //   this.area = new Area(
  //     this.settings.para.areas.folder,
  //     this.app,
  //     this.settings,
  //     this.file,
  //     this.locale
  //   );
  //   this.resource = new Resource(
  //     this.settings.para.resources.folder,
  //     this.app,
  //     this.settings,
  //     this.file,
  //     this.locale
  //   );
  //   this.archive = new Archive(
  //     this.settings.para.archives.folder,
  //     this.app,
  //     this.settings,
  //     this.file,
  //     this.locale
  //   );
  //
  //   PARAStore.set({
  //     project: this.project,
  //     area: this.area,
  //     resources: this.resource,
  //     archives: this.archive
  //   })
  // }

  // loadGlobalHelpers() {
  //   const helpers = {
  //     Project: this.project,
  //     Area: this.area,
  //     Resource: this.resource,
  //     Archive: this.archive,
  //     Task: this.task,
  //     File: this.file,
  //     Bullet: this.bullet,
  //     Date: this.date,
  //   };
  //
  //   // TODO: add this to the global namespace
  //   (window as any).BrainOS = helpers;
  // }

  setupCodeBlocks() {

    const handler = (
      source: keyof typeof this.codeBlockViews,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => {
      const view = source.trim() as keyof typeof this.codeBlockViews;

      if (!view) {
        return renderError(
          this.app,
          I18N_MAP[this.locale][`${ERROR_MESSAGE}NO_VIEW_PROVIDED`],
          el.createEl('div'),
          ctx.sourcePath
        );
      }

      if (
        !Object.keys(this.codeBlockViews).includes(view)
      ) {
        return renderError(
          this.app,
          `${I18N_MAP[this.locale][`${ERROR_MESSAGE}NO_VIEW_EXISTED`]}: ${view}`,
          el.createEl('div'),
          ctx.sourcePath
        );
      }

      const callback = this.codeBlockViews[view];

      return callback(view, el, ctx);
    };
    this.registerMarkdownCodeBlockProcessor('BrainOS', handler);
  }

  // async initCodeBlockViews() {
  //   // TODO: fix this to correspond with the new workflow and structure of this plugin
  //   this.codeBlockViews = {
  //     // views by time -> time context -> periodic notes
  //     ProjectListByTime: this.project.listByTime,
  //     AreaListByTime: this.area.listByTime,
  //     TaskRecordListByTime: this.task.recordListByTime,
  //     TaskDoneListByTime: this.task.doneListByTime,
  //     // views by tag -> topic context -> para
  //     TaskListByTag: this.task.listByTag,
  //     BulletListByTag: this.bullet.listByTag,
  //     FileListByTag: this.file.listByTag,
  //     ProjectListByTag: this.project.listByTag,
  //     AreaListByTag: this.area.listByTag,
  //     ResourceListByTag: this.resource.listByTag,
  //     ArchiveListByTag: this.archive.listByTag,
  //     // views by folder
  //     ProjectListByFolder: this.project.listByFolder,
  //     AreaListByFolder: this.area.listByFolder,
  //     ResourceListByFolder: this.resource.listByFolder,
  //     ArchiveListByFolder: this.archive.listByFolder,
  //   };
  // }


  // Commands
  activatePARACommands() {

    this.addCommand({
      id: "brainos-create-para-note",
      name: "PARA > Create PARA Note",
      callback: () => {
        new SelectPARAType(this.app).open()
      },
    })


    this.addCommand({
      id: "brainos-archive-para-entry",
      name: "PARA > Archive PARA Entry",
      callback: () => {
        new SelectPARAToArchiveType(this.app).open()
      },
    })

  }


  // LEAF VIEW 
  async activatePeriodicView() {
    this.app.workspace.detachLeavesOfType(PERIODIC_VIEW);

    await this.app.workspace.getRightLeaf(false)?.setViewState({
      type: PERIODIC_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(PERIODIC_VIEW)[0],
    );
  }

  async activateParaView() {
    this.app.workspace.detachLeavesOfType(PARA_VIEW);

    await this.app.workspace.getRightLeaf(false)?.setViewState({
      type: PARA_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(PARA_VIEW)[0],
    );
  }

  async activateMediaView() {
    this.app.workspace.detachLeavesOfType(MEDIA_CONSUMPTION_VIEW);

    await this.app.workspace.getRightLeaf(false)?.setViewState({
      type: MEDIA_CONSUMPTION_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(MEDIA_CONSUMPTION_VIEW)[0],
    );
  }

  async activateIntegratorView() {
    this.app.workspace.detachLeavesOfType(INTEGRATOR_VIEW);

    await this.app.workspace.getRightLeaf(false)?.setViewState({
      type: INTEGRATOR_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(INTEGRATOR_VIEW)[0],
    );
  }
}
