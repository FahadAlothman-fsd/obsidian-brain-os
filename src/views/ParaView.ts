import { ItemView, WorkspaceLeaf } from "obsidian";
import Para from '../components/para/index.svelte'

export const PARA_VIEW = "para-view";

export class ParaView extends ItemView {
  component!: Para;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
  getViewType() {
    return PARA_VIEW;
  }

  getDisplayText() {
    return "PARA View";
  }

  getIcon(): string {
    return "infinity";
  }

  async onOpen() {
    this.component = new Para({
      target: this.contentEl,
    });
  }

  async onClose() {
    this.component.$destroy();
  }
}


