import { App, Notice, FuzzySuggestModal, Modal, Setting, type FuzzyMatch, TFile, TFolder, TAbstractFile } from "obsidian"
import { PROJECT, AREA, SUB_AREA, RESOURCE, ARCHIVE } from "../../constants";
import { projectStore, areaStore, resourceStore, plugin, archiveStore } from "../../stores";
import { get } from "svelte/store";
import type { AreaEntryType, ProjectEntryType, ResourceEntryType, statusType } from "../../types/paraTypes";
import type { BrainSettings } from "../../types";
import type BrainOS from "../../main";
import { StatusType } from "../../utils";


const stores = {
  [PROJECT]: projectStore,
  [AREA]: areaStore,
  [RESOURCE]: resourceStore,
}


type PARType = typeof PROJECT | typeof AREA | typeof RESOURCE

type PARAEntry = ProjectEntryType | AreaEntryType | ResourceEntryType
type PARAEntries = ProjectEntryType[] | AreaEntryType[] | ResourceEntryType[]


// this modal will do the followling:
// - input of the file name
// - create or select an exisiting folder to put the file in (for now add a toggle for either dropdown or input)
// when all the inputs are valid use the createFile func to create the file
export class ArchivePARAEntryNoteModal extends Modal {
  result: { description: string; status: string };
  onSubmit: (result: { description: string; status: string }) => Promise<void>;
  para_entry: PARAEntry
  archive_statuses: statusType[]
  para_type: PARType

  constructor(app: App, para_entry: PARAEntry, para_type: PARType, onSubmit: (result: { description: string; status: string }) => Promise<void>) {
    super(app);
    this.onSubmit = onSubmit;
    this.result = { description: "", status: "" }
    this.para_entry = para_entry
    this.archive_statuses = []
    this.para_type = para_type
    const brainOS: BrainOS | undefined = get(plugin)

    if (brainOS) {

      let statuses: statusType[] = []
      let filters: (val: statusType) => boolean
      if (this.para_type === PROJECT) {
        statuses = brainOS.settings.para.projects.project_statuses
        filters = (val) => {
          return val.type === StatusType.DONE || val.type === StatusType.ON_HOLD || val.type === StatusType.CANCELLED
        }

      } else if (this.para_type === RESOURCE) {
        statuses = brainOS.settings.para.resources.resource_statuses
        filters = (val) => {
          return val.type === StatusType.DONE || val.type === StatusType.ON_HOLD || val.type === StatusType.CANCELLED || val.type === StatusType.IRRELEVANT

        }
      } else if (this.para_type === AREA) {

        statuses = brainOS.settings.para.resources.resource_statuses
        filters = (val) => {
          return val.type === StatusType.ON_HOLD || val.type === StatusType.IRRELEVANT

        }
      }


      const result = statuses.filter((val) => filters(val))

      if (result.length === 0) {
        new Notice(`No archive statuses exist for ${this.para_type.toLowerCase()}s`)
      }
      this.archive_statuses = result
    }
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h4", { text: `Archiving ${this.para_type.toLowerCase()}: ${this.para_entry.README.name.split(".")[0]}` });


    new Setting(contentEl)
      .setName("Reason for archiving")
      .addTextArea((text) =>
        text
          .setValue(this.result.description)
          .onChange((value) => {
            this.result.description = value
          }));

    if (this.archive_statuses.length > 0) {

      const description = new DocumentFragment()

      const select_description = description.createSpan()
      select_description.setText(`This status will be used to track the different types of archived ${this.para_type.toLowerCase()}s`)
      if (this.para_type === AREA) {

        const area_status_note = description.createSpan()
        area_status_note.setText("* only resource statuses of the following types will be available for areas:")
        description.append(area_status_note)

        Array.of(StatusType.ON_HOLD, StatusType.IRRELEVANT).forEach((status) => {

          const area_status_type = description.createSpan()
          area_status_type.setText(`- ${status}`)
          description.append(area_status_type)
        })
      }

      new Setting(contentEl)
        .setName("Archiving Status")
        .setDesc(description)
        .addDropdown((dropdown) => {
          this.archive_statuses.forEach((choice) => {
            dropdown.addOption(choice.id, choice.name)
          })

          dropdown.setValue(this.result.status).onChange((v) => {
            this.result.status = v;
          });
        });


    }


    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Submit")
          .setCta()
          .onClick(async () => {

            const errors = (() => {
              const errors = []
              if (this.result.description.length === 0) {
                errors.push(`please enter an archiving reason for ${this.para_entry.README.name.split(".")[0]}`)
              }

              if (this.result.status.length === 0) {
                errors.push(`please enter an archive status for ${this.para_entry.README.name.split(".")[0]}`)
              }

              if (errors.length > 0) {
                return errors
              }


              return []
            })();
            if (errors.length > 0) {
              errors.join('\n\n') + '\n\n' + 'Fix errors before saving.';
              // console.debug(message);
              const { containerEl } = this

              const errorDiv = containerEl.createDiv()
              errorDiv.addClasses(["flex", "flex-col", "gap-4"])
              errors.forEach((val, index) => {
                const err = errorDiv.createSpan()
                err.setText(val)
                err.addClasses(["text-magnum-700"])
                // TODO: add an hr for all elements except the last

              })
              const resolve_message = errorDiv.createSpan()
              resolve_message.setText('Fix errors before saving.')
              resolve_message.addClasses(["text-magnum-900"])
              const error = new DocumentFragment()
              error.append(errorDiv)
              new Notice(error);
              return;
            } else {

              this.close();
              await this.onSubmit(this.result);
              archiveStore.loadEntries()
            }
          }));
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}

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
    // TODO: for areas and projects, it should act the same. But for resources there are two things:
    //  - you should be able to archive resource entries (the root README of the resource type)
    //  - you should be able to archive resource type entries (a folder and file)
    //  - for archiving resource type entries the folder structure is as follows: 
    //      - archive/resource/resource_type/resource_entry 
    //  - for archving resources entries the status and reason will be in the root README
    //  - for archving resource type entries the status and reason will be in:
    //      - the file (if its only a file)
    //      - folder it will be in the README of that folder
    new Notice(`Selected the ${PAR.README.name.split(".")[0]} ${this.para_type} to archive`);
    new ArchivePARAEntryNoteModal(this.app, PAR, this.para_type, async (result) => {
      new Notice(`archive status: ${result.status}\narchive description: ${result.description}`)

      const brainOS = get(plugin)
      if (brainOS) {
        await this.app.fileManager.processFrontMatter(PAR.README, (frontmatter) => {

          if (this.para_type === PROJECT) {
            frontmatter[brainOS.settings.para.projects.status_frontmatter] = result.status
          } else {
            frontmatter['archiving_status'] = result.status
          }

          frontmatter['archiving_reason'] = result.description

          frontmatter['archived_on'] = window.moment().format("YYYY-MM-DDTHH:mm").toString()
        })

        if (PAR.folder_name) {
          // TODO: move this later on to the file util for general folder search
          const folder_path = `${brainOS.settings.para.archives.folder}/${this.para_type}`
          folder_path.split("/").forEach(async (_, index, arr) => {
            const fd_path = arr.slice(0, index + 1).join("/")
            if (!this.app.vault.getAbstractFileByPath(fd_path)) {

              await this.app.vault.createFolder(fd_path);
            }
          })
          try {
            await this.app.fileManager.renameFile(PAR.folder_name, `${folder_path}/${PAR.folder_name.name}`)
          } catch (error) {
            if (error instanceof Error) {
              new Notice(error.message)
            }

          } finally {
            stores[this.para_type].loadEntries()
          }

        }
      } else {
        new Notice("Settings were not configured")
      }

    }).open()
  }
}




export class SelectPARAToArchiveType extends FuzzySuggestModal<PARType> {

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
