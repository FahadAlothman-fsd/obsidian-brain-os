import { Modal, Notice, Setting, TextComponent } from 'obsidian';
import type { Plugin, ToggleComponent } from 'obsidian';
import { StatusType, StatusConfiguration, Status, StatusValidator } from '../utils';
import { PROJECT, RESOURCE } from '../constants';
import type BrainOS from '../main';

type PARAStatusType = typeof PROJECT | typeof RESOURCE
const validator = new StatusValidator();

export class CustomStatusModal extends Modal {
  statusName: string;
  type: StatusType;
  default_status: boolean;
  para_type: PARAStatusType
  saved: boolean = false;
  error: boolean = false;
  title: string;
  original: StatusConfiguration

  constructor(public plugin: BrainOS, statusType: StatusConfiguration, para_type: PARAStatusType, title: string) {
    super(plugin.app);
    this.statusName = statusType.name;
    this.type = statusType.type;
    this.para_type = para_type;
    this.default_status = statusType.default_status
    this.title = title
    this.original = new StatusConfiguration(this.statusName, this.type, this.default_status)
  }

  /**
   * Return a {@link StatusConfiguration} from the modal's contents
   */
  public statusConfiguration() {
    return new StatusConfiguration(
      this.statusName,
      this.type,
      this.default_status,
    );
  }

  async display() {
    const { contentEl } = this;

    contentEl.empty();
    contentEl.title = this.title
    contentEl.addClasses(["space-y-2"])

    const titleEl = contentEl.createDiv();
    titleEl.addClasses(["mb-2"])
    titleEl.setText(this.title)

    const settingDiv = contentEl.createDiv();



    let statusNameText: TextComponent;
    new Setting(settingDiv)
      .setName(`${this.para_type.toLowerCase()} Status Name`)
      .setDesc(`This is the friendly name of the ${this.para_type.toLowerCase()} status.`)
      .addText((text) => {
        statusNameText = text;
        text.setValue(this.statusName).onChange((v) => {
          this.statusName = v;
          CustomStatusModal.setValid(text, validator.validateName(this.statusConfiguration()));
        });
      })
      .then((_setting) => {
        CustomStatusModal.setValid(statusNameText, validator.validateName(this.statusConfiguration()));
      });


    new Setting(settingDiv)
      .setName(`${this.para_type.toLowerCase()} Status Type`)
      .setDesc('Control how the status behaves for searching, archiving, and tracking.')
      .addDropdown((dropdown) => {
        const types = [
          StatusType.NEW,
          StatusType.IN_PROGRESS,
          StatusType.POST_PROCESSING,
          StatusType.DONE,
          StatusType.CANCELLED,
          StatusType.ON_HOLD,
        ];
        if (this.para_type === RESOURCE) {
          types.push(StatusType.IRRELEVANT)
        }
        types.forEach((s) => {
          dropdown.addOption(s, s);
        });
        dropdown.setValue(this.type).onChange((v) => {
          this.type = Status.getTypeFromStatusTypeString(v);
        });
      });

    new Setting(settingDiv)
      .setName('default')
      .setDesc(`if a ${this.para_type.toLowerCase()} is created, this will be the default state `)
      .addToggle((toggle) =>
        toggle
          .setValue(this.default_status)
          .onChange(async (value) => {
            this.default_status = value
          })
      );

    const footerEl = contentEl.createDiv();
    const footerButtons = new Setting(footerEl);
    footerButtons.addButton((b) => {
      b.setTooltip('Save')
        .setIcon('checkmark')
        .onClick(async () => {
          const errors = validator.validate(this.plugin, this.statusConfiguration(), this.para_type, this.original);
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
          }
          this.saved = true;
          this.close();
        });
      return b;
    });
    footerButtons.addExtraButton((b) => {
      b.setIcon('cross')
        .setTooltip('Cancel')
        .onClick(() => {
          this.saved = false;
          this.close();
        });
      return b;
    });
  }

  onOpen() {
    this.display();
  }

  static setValidationError(textInput: TextComponent) {
    textInput.inputEl.addClass('tasks-settings-is-invalid');
  }

  static removeValidationError(textInput: TextComponent) {
    textInput.inputEl.removeClass('tasks-settings-is-invalid');
  }

  private static setValid(text: TextComponent, messages: string[]) {
    const valid = messages.length === 0;
    if (valid) {
      CustomStatusModal.removeValidationError(text);
    } else {
      CustomStatusModal.setValidationError(text);
    }
  }
}
