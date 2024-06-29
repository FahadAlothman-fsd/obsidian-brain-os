import { Plugin, setIcon } from "obsidian";
import type {
  App,
  MarkdownPostProcessorContext,
  PluginManifest,
  TFile
} from 'obsidian';
import "virtual:uno.css";
import { DataviewApi, getAPI, isPluginEnabled } from 'obsidian-dataview';
import {
  PeriodicView, PERIODIC_VIEW,
  ParaView, PARA_VIEW,
  MediaConsumptionView, MEDIA_CONSUMPTION_VIEW,
  IntegratorView, INTEGRATOR_VIEW
} from "./views";
import { File } from "./files";
import { plugin, tagsStore } from './stores';
import { LogLevel, type BrainSettings } from "./types";
import { DEFAULT_SETTINGS, SettingTab } from "./SettingsTab";
import { logMessage, renderError } from "./utils";
import { I18N_MAP } from "./i18n";
import { ERROR_MESSAGE } from "./constants";



export default class BrainOS extends Plugin {
  settings!: BrainSettings;
  locale: string


  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.locale = window.moment().locale()
    if (!isPluginEnabled(app)) {
      logMessage(
        I18N_MAP[this.locale][`${ERROR_MESSAGE}NO_DATAVIEW_INSTALL`],
        LogLevel.error
      );
      return;
    }

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
    if (Object.entries(data).length !== 0) {
      this.settings = JSON.parse(JSON.stringify(data))
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // await this.initCodeBlockViews()
  }

  async onload() {
    await this.loadSettings();

    plugin.set(this);
    tagsStore.reload();

    // this.plugins.getPlugin("nldates-obsidian")
    // console.log(this.app.plugins.enabledPlugin.has('para-periodic'))
    await this.setupBrainOSViews()

    // this.loadHelpers()
    // this.setupCodeBlocks()

    this.addSettingTab(new SettingTab(this.app, this));
  }

  onunload() {
    console.log("unloading plugin");
  }

  async setupBrainOSViews() {

    this.registerView(PARA_VIEW, (leaf) => new ParaView(leaf));
    this.registerView(PERIODIC_VIEW, (leaf) => new PeriodicView(leaf));
    this.registerView(INTEGRATOR_VIEW, (leaf) => new IntegratorView(leaf));
    this.registerView(MEDIA_CONSUMPTION_VIEW, (leaf) => new MediaConsumptionView(leaf));


    this.addRibbonIcon("infinity", "BOS: PARA view", () => {
      this.activateParaView();
    });

    this.addRibbonIcon("calendar-clock", "BOS: Periodic view", () => {
      this.activatePeriodicView();
    });

    this.addRibbonIcon("book-marked", "BOS: Media view", () => {
      this.activateMediaView();
    });

    this.addRibbonIcon("shapes", "BOS: Integrator view", () => {
      this.activateIntegratorView();
    });


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
  //   (window as any).PeriodicPARA = helpers;
  //   (window as any).LifeOS = helpers;
  // }

  // setupCodeBlocks() {
  //
  //   const handler = (
  //     source: keyof typeof this.codeBlockViews,
  //     el: HTMLElement,
  //     ctx: MarkdownPostProcessorContext
  //   ) => {
  //     const view = source.trim() as keyof typeof this.codeBlockViews;
  //
  //     if (!view) {
  //       return renderError(
  //         this.app,
  //         I18N_MAP[this.locale][`${ERROR_MESSAGE}NO_VIEW_PROVIDED`],
  //         el.createEl('div'),
  //         ctx.sourcePath
  //       );
  //     }
  //
  //     if (
  //       !Object.keys(this.codeBlockViews).includes(view)
  //     ) {
  //       return renderError(
  //         this.app,
  //         `${I18N_MAP[this.locale][`${ERROR_MESSAGE}NO_VIEW_EXISTED`]}: ${view}`,
  //         el.createEl('div'),
  //         ctx.sourcePath
  //       );
  //     }
  //
  //     const callback = this.codeBlockViews[view];
  //
  //     return callback(view, el, ctx);
  //   };
  //   this.registerMarkdownCodeBlockProcessor('BrainOS', handler);
  // }

  // async initCodeBlockViews() {
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

  // LEAF VIEW 
  async activatePeriodicView() {
    this.app.workspace.detachLeavesOfType(PERIODIC_VIEW);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: PERIODIC_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(PERIODIC_VIEW)[0],
    );
  }

  async activateParaView() {
    this.app.workspace.detachLeavesOfType(PARA_VIEW);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: PARA_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(PARA_VIEW)[0],
    );
  }

  async activateMediaView() {
    this.app.workspace.detachLeavesOfType(MEDIA_CONSUMPTION_VIEW);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: MEDIA_CONSUMPTION_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(MEDIA_CONSUMPTION_VIEW)[0],
    );
  }

  async activateIntegratorView() {
    this.app.workspace.detachLeavesOfType(INTEGRATOR_VIEW);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: INTEGRATOR_VIEW,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(INTEGRATOR_VIEW)[0],
    );
  }
}
