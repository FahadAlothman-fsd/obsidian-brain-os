import { Plugin, setIcon } from "obsidian";
import type {
  App,
  MarkdownPostProcessorContext,
  PluginManifest,
  TFile
} from 'obsidian';
import "virtual:uno.css";
import { DataviewApi, getAPI, isPluginEnabled } from 'obsidian-dataview';
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./views/ExampleView";
import {
  PeriodicView, PERIODIC_VIEW,
  ParaView, PARA_VIEW,
  MediaConsumptionView, MEDIA_CONSUMPTION_VIEW,
  IntegratorView, INTEGRATOR_VIEW
} from "./views";
import { plugin, tagsStore } from './stores';
import type { PluginSettings, BrainSettings } from "./types";
import { DEFAULT_SETTINGS, SettingTab } from "./SettingsTab";


type tagPageEvent = {
  tag: string
  file?: TFile | Promise<TFile>
}



export default class BrainOS extends Plugin {
  settings!: BrainSettings;

  async loadSettings() {
    let data = await this.loadData()
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
    if (Object.entries(data).length !== 0) {
      this.settings = JSON.parse(JSON.stringify(data))
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async onload() {
    await this.loadSettings();

    plugin.set(this)
    tagsStore.set(Object.entries(
      // @ts-ignore comment
      this.app.metadataCache.getTags() as Record<string, number>,
    )
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => {
        return { value: tag, count: count };
      }))
    this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));
    this.registerView(PARA_VIEW, (leaf) => new ParaView(leaf));
    this.registerView(PERIODIC_VIEW, (leaf) => new PeriodicView(leaf));
    this.registerView(INTEGRATOR_VIEW, (leaf) => new IntegratorView(leaf));
    this.registerView(MEDIA_CONSUMPTION_VIEW, (leaf) => new MediaConsumptionView(leaf));

    // this.addRibbonIcon("brain", "BrainOS view", () => {
    //   this.activateView();
    // });

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


    // // @ts-ignore comment
    // this.registerEvent(this.app.workspace.on("tag-page:did-create", (evt: tagPageEvent) => {
    //   console.log('updated tags')
    //   tagsStore.set(Object.entries(
    //     // @ts-ignore comment
    //     this.app.metadataCache.getTags() as Record<string, number>,
    //   )
    //     .sort((a, b) => b[1] - a[1])
    //     .map(([tag, count]) => {
    //       return { value: tag, count: count };
    //     }))
    // }));

    this.addSettingTab(new SettingTab(this.app, this));
  }

  onunload() {
    console.log("unloading plugin");
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_EXAMPLE,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0],
    );
  }

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
