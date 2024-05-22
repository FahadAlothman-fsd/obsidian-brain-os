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
    return "Periodic View";
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


