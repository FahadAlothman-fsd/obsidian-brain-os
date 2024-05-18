import { ItemView, WorkspaceLeaf } from "obsidian";
import Periodic from '../components/periodic/index.svelte'

export const PERIODIC_VIEW = "periodic-view";

export class PeriodicView extends ItemView {
  component!: Periodic;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
  getViewType() {
    return PERIODIC_VIEW;
  }

  getDisplayText() {
    return "Example view";
  }

  getIcon(): string {
    return "calendar-clock";
  }

  async onOpen() {
    this.component = new Periodic({
      target: this.contentEl,
    });
  }

  async onClose() {
    this.component.$destroy();
  }
}


