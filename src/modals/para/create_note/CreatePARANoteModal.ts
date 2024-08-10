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

// this modal will do the followling:
// - input of the file name
// - create or select an exisiting folder to put the file in (for now add a toggle for either dropdown or input)
// when all the inputs are valid use the createFile func to create the file
export class createPARAEntryNoteModal extends Modal {
  result: { name: string; folder: string };
  onSubmit: (result: { name: string; folder: string }) => Promise<void>;
  new_folder: boolean
  para_entry: PARAEntry
  folders: TFolder[]

  constructor(app: App, onSubmit: (result: { name: string; folder: string }) => Promise<void>, para_entry: PARAEntry) {
    super(app);
    this.onSubmit = onSubmit;
    this.result = { name: "", folder: "" }
    this.new_folder = false
    this.para_entry = para_entry
    this.folders = []

    if (this.para_entry.folder_name) {

      const stack = [this.para_entry.folder_name]
      const visited = new Set<TAbstractFile>()
      const result: TFolder[] = []
      while (stack.length > 0) {
        const vertex = stack.pop()

        if (vertex !== undefined) {
          if (!visited.has(vertex)) {
            visited.add(vertex)


            if (vertex.children.length > 0) {
              const PARAEntryFolders = vertex.children.sort().filter((file) => file instanceof TFolder);
              if (PARAEntryFolders) {
                result.push(...PARAEntryFolders)
              }

            }
            for (const neighbor of vertex.children.sort().filter((file) => file instanceof TFolder)) {
              stack.push(neighbor as TFolder);
            }
          }
        }
      }
      if (result.length === 0) {
        new Notice(`No folders exist in ${this.para_entry.README.name.split(".")[0]}`)
        this.new_folder = true
      }
      this.folders = result
    }
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h4", { text: "New PARA Note" });


    new Setting(contentEl)
      .setName('Existing/New Folder')
      .setDesc(`Whether you want to choose an exisiting folder in ${this.para_entry.README.name.split(".")[0]} or create an new folder`)
      .addToggle((toggle) =>
        toggle
          .setValue(this.new_folder)
          .onChange((value) => {
            let newVal = this.new_folder
            if (this.folders.length > 0 && !value) {
              newVal = value;
            } else if (value) {
              newVal = value;
            } else {
              new Notice(`No folders exist in ${this.para_entry.README.name.split(".")[0]}`)
            }
            if (newVal !== this.new_folder) {
              this.new_folder = newVal
            }

            contentEl.empty();
            this.onOpen()
          })
      );
    new Setting(contentEl)
      .setName("File Name")
      .addText((text) =>
        text
          .setValue(this.result.name)
          .onChange((value) => {
            this.result.name = value
          }));

    if (!this.new_folder && this.folders.length > 0) {


      new Setting(contentEl)
        .setName("Existing Folder")
        .setDesc(`choose a folder that exists in ${this.para_entry.README.name.split(".")[0]} \n leave blank if you want it in the root directory`)
        .addDropdown((dropdown) => {
          this.folders.forEach((choice) => {
            dropdown.addOption(choice.path, choice.name)
          })

          dropdown.setValue(this.folders.some((val) => val.name === this.result.folder) ? this.result.folder : "").onChange((v) => {
            this.result.folder = v;
          });
        });
    } else {


      new Setting(contentEl)
        .setName("New Folder")
        .setDesc(`this will create a new folder inside ${this.para_entry.README.name.split(".")[0]}\nleave blank if you want it in the root directory `)
        .addText((text) =>
          text
            .setValue(!this.folders.some((val) => val.name === this.result.folder) ? this.result.folder : "")
            .onChange((value) => {
              this.result.folder = value
            }));
    }
    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Submit")
          .setCta()
          .onClick(async () => {

            const errors = (() => {
              const errors = []
              if (this.result.name.length === 0) {
                errors.push("please enter a name for the file")
              }

              if (errors.length > 0) {
                return errors
              }


              return []
            })();
            if (errors.length > 0) {
              const message = errors.join('\n\n') + '\n\n' + 'Fix errors before saving.';
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

              console.log(this.new_folder,
                this.result.folder.length > 0,
                this.para_entry.folder_name,
                this.new_folder && this.result.folder.length > 0 && this.para_entry.folder_name)
              if (this.new_folder && this.result.folder.length > 0 && this.para_entry.folder_name) {
                console.log(this.result.folder)
                this.result.folder = `${this.para_entry.folder_name.path}/${this.result.folder}`
                console.log(this.result.folder)
              }
              this.close();
              await this.onSubmit(this.result);
            }
          }));
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}


export class selectPARAEntryTemplateModal extends FuzzySuggestModal<TFile> {
  para_entry: PARAEntry
  entries: TFile[]


  constructor(app: App, para_entry: PARAEntry) {
    super(app)
    this.para_entry = para_entry
    this.entries = this.para_entry.related_templates
  }

  getItems(): TFile[] {
    return this.entries || [];
  }

  getItemText(template: TFile) {
    const brainOS = get(plugin)
    return brainOS ? getRelativePath(brainOS.settings.otherTemplates, trimFile(template))
      : "";
  }

  renderSuggestion(template: FuzzyMatch<TFile>, el: HTMLElement) {
    const brainOS = get(plugin)
    let text = ""

    if (template.item.extension && !template.item.path.contains(".excalidraw.md")) {
      if (brainOS) {
        text = getRelativePath(brainOS.settings.otherTemplates, trimFile(template.item))
      }
      el.setText(text);
      el.insertAdjacentHTML(
        "beforeend",
        `<div class="nav-file-tag" style="display:inline-block;vertical-align:middle">${template.item.extension}</div>`
      );
    }
    else {
      // we don't use trimFile here as the extension isn't displayed here
      el.setText(template.item.path.slice(0, -1 * (".excalidraw.md".length)))
      el.insertAdjacentHTML(
        "beforeend",
        `<div class="nav-file-tag" style="display:inline-block;vertical-align:middle">excalidraw</div>`
      );
    }


  }

  async onChooseItem(template: TFile, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${template.name}`);
    new Notice(`template path: ${template.path}`)
    let data: { locale: string, templateFile: string, folder: string, file: string } = {
      locale: window.moment().locale(),
      templateFile: template.path,
      folder: "",
      file: ""
    }
    if (this.para_entry.folder_name) {
      data.folder = this.para_entry.folder_name.path
    }
    new createPARAEntryNoteModal(this.app, async (result) => {
      new Notice(`file to create: ${result.name}`)
      new Notice(`in folder to create: ${result.folder}`)
      if (result.folder.length > 0) {
        data.folder = result.folder

      }
      data.file = `${data.folder}/${result.name}.md`

      const file = await createFile(this.app, {
        ...data,
      })
      if (file instanceof TFile) {

        await this.app.workspace.getLeaf().openFile(file);
      }
    }, this.para_entry).open()


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
    new Notice(`Selected the ${PAR.README.name.split(".")[0]} ${this.para_type}`);
    new selectPARAEntryTemplateModal(this.app, PAR).open()
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



