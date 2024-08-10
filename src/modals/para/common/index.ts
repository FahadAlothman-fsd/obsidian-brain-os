import { App, Notice, FuzzySuggestModal, Modal, Setting, type FuzzyMatch, TFile, TFolder, TAbstractFile } from "obsidian"
import { PROJECT, AREA, SUB_AREA, RESOURCE, ARCHIVE } from "../../../constants";
import { projectStore, areaStore, resourceStore, plugin } from "../../../stores";
import { get } from "svelte/store";
import type { AreaEntryType, ProjectEntryType, ResourceEntryType } from "../../../types/paraTypes";
import { createFile, getRelativePath, trimFile } from "../../../utils/files";


const stores = {
  [PROJECT]: projectStore,
  [AREA]: areaStore,
  [RESOURCE]: resourceStore,
}


type PARType = typeof PROJECT | typeof AREA | typeof RESOURCE

type PARAEntry = ProjectEntryType | AreaEntryType | ResourceEntryType
type PARAEntries = ProjectEntryType[] | AreaEntryType[] | ResourceEntryType[]



export class selectPARAEntryModal extends FuzzySuggestModal<PARAEntry> {
  para_type: PARType
  store: typeof projectStore | typeof areaStore | typeof resourceStore
  entries: PARAEntries


  constructor(app: App, para_type: PARType) {
    super(app)
    this.para_type = para_type
    this.store = stores[this.para_type]
    this.entries = this.store.getEntries()
  }

  getItems(): PARAEntry[] {
    return this.entries || [];
  }

  getItemText(para_entry: PARAEntry) {
    return para_entry.README?.name.split(".")[0] || "";
  }

  renderSuggestion(para_entry: FuzzyMatch<PARAEntry>, el: HTMLElement) {
    el.createEl("div", { text: para_entry.item.README.name });
    el.createEl("small", { text: para_entry.item.tag });
  }

  onChooseItem(PAR: PARAEntry, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected the ${PAR.README.name.split(".")[0]} ${this.para_type}`);
    // new selectPARAEntryTemplateModal(this.app, PAR).open()
  }
}




export class SelectPARAType extends FuzzySuggestModal<PARType> {

  getItems(): PARType[] {
    return [PROJECT, AREA, RESOURCE];
  }

  getItemText(PAR: PARType): string {
    return PAR;
  }

  onChooseItem(PAR: PARType, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${PAR}`);
    new selectPARAEntryModal(this.app, PAR).open()
  }
}
