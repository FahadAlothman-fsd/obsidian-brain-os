import { AbstractInputSuggest, App, TAbstractFile, TFile } from "obsidian";
import { trimFile } from "../files";
import { StatusType } from "../status";
import { PROJECT, RESOURCE } from "../../constants";

type PARAStatusType = typeof PROJECT | typeof RESOURCE

export class StatusSuggest extends AbstractInputSuggest<StatusType> {
  textInputEl!: HTMLInputElement;
  type: PARAStatusType

  constructor(app: App, textInputEl: HTMLInputElement | HTMLDivElement, type: PARAStatusType) {
    super(app, textInputEl)
    this.type = type

  }

  getSuggestions(inputStr: string): StatusType[] {
    const statusTypes = [
      StatusType.NEW,
      StatusType.IN_PROGRESS,
      StatusType.DONE,
      StatusType.CANCELLED,
      StatusType.ON_HOLD,
      StatusType.IRRELEVANT,
    ]
    if (this.type === PROJECT) {
      statusTypes.remove(StatusType.IRRELEVANT)
    }
    const statuses: StatusType[] = [];
    const inputLower = inputStr.toLowerCase();

    statusTypes.forEach((status) => {
      if (status.toLowerCase().contains(inputLower)) {
        statuses.push(status);
      }
    });

    return statuses;
  }

  renderSuggestion(status: StatusType, el: HTMLElement) {
    el.setText(status)
  }

  selectSuggestion(status: StatusType) {
    this.textInputEl.value = status;
    this.textInputEl.trigger("input");
    this.close();
  }
}
