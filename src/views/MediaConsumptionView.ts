import { ItemView, type WorkspaceLeaf } from "obsidian";
import MediaConsumption from '../components/media/index.svelte'

export const MEDIA_CONSUMPTION_VIEW = "media-consumption-view";

export class MediaConsumptionView extends ItemView {
  component!: MediaConsumption;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
  getViewType() {
    return MEDIA_CONSUMPTION_VIEW;
  }

  getDisplayText() {
    return "Media View";
  }

  getIcon(): string {
    return "book-marked";
  }

  async onOpen() {
    this.component = new MediaConsumption({
      target: this.contentEl,
    });
  }

  async onClose() {
    this.component.$destroy();
  }
}


