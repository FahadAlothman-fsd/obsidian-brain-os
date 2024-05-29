import { AbstractInputSuggest, TAbstractFile, TFolder } from "obsidian";

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
  textInputEl!: HTMLInputElement;

  getSuggestions(inputStr: string): TFolder[] {
    const abstractFiles = this.app.vault.getAllLoadedFiles();
    const files: TFolder[] = [];
    const inputLower = inputStr.toLowerCase();

    abstractFiles.forEach((file: TAbstractFile) => {
      if (
        file instanceof TFolder && file.path.toLowerCase().contains(inputLower)
      ) {
        files.push(file);
      }
    });

    return files;
  }

  renderSuggestion(file: TFolder, el: HTMLElement) {
    el.setText(file.path);
  }

  selectSuggestion(file: TFolder) {
    this.textInputEl.value = file.path;
    this.textInputEl.trigger("input");
    this.close();
  }
}
