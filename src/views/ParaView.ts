import { ItemView, WorkspaceLeaf } from "obsidian";
import Para from '../components/para/index.svelte'
import { I18N_MAP } from "../i18n";
import { PLUGIN_NAME } from "../constants";

export const PARA_VIEW = "para-view";

export class ParaView extends ItemView {
  component!: Para;
  locale: string

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.locale = window.moment().locale()

  }
  getViewType() {
    return PARA_VIEW;
  }

  getDisplayText() {
    return `${I18N_MAP[this.locale][PLUGIN_NAME]}: PARA View`;
  }

  getIcon(): string {
    return "infinity";
  }

  async onOpen() {
    this.component = new Para({
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


