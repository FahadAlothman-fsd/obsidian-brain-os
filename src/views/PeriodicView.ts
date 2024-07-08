import { ItemView, WorkspaceLeaf } from "obsidian";
import Periodic from '../components/periodic/index.svelte'
import { I18N_MAP } from "../i18n";
import { PLUGIN_NAME } from "../constants";

export const PERIODIC_VIEW = "periodic-view";

export class PeriodicView extends ItemView {
  component!: Periodic;
  locale: string

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.locale = window.moment().locale()

  }
  getViewType() {
    return PERIODIC_VIEW;
  }

  getDisplayText() {
    return `${I18N_MAP[this.locale][PLUGIN_NAME]}: Periodic View`;
  }

  getIcon(): string {
    return "calendar-clock";
  }

  async onOpen() {
    this.component = new Periodic({
      target: this.contentEl,
      props: {
        width: this.contentEl.innerWidth
      }
    });
  }

  async onClose() {
    this.component.$destroy();
  }
}


