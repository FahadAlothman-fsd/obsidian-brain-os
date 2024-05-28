import { Plugin, setIcon } from "obsidian";
import type {
  App,
  MarkdownPostProcessorContext,
  PluginManifest,
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
import { pluginStore } from './stores';
import type { PluginSettings, BrainSettings } from "./types";
import { DEFAULT_SETTINGS, SettingTab } from "./SettingsTab";



export default class BrainOS extends Plugin {
  settings!: PluginSettings;

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async onload() {
    await this.loadSettings();

    pluginStore.plugin.set(this)
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
