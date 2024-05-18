import { ItemView, WorkspaceLeaf } from "obsidian";
import Integrator from '../components/integrator/index.svelte'

export const INTEGRATOR_VIEW = "integrator-view";

export class IntegratorView extends ItemView {
  component!: Integrator;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
  getViewType() {
    return INTEGRATOR_VIEW;
  }

  getDisplayText() {
    return "Integrator View";
  }

  getIcon(): string {
    return "blocks";
  }

  async onOpen() {
    this.component = new Integrator({
      target: this.contentEl,
    });
  }

  async onClose() {
    this.component.$destroy();
  }
}


