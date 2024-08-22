import { PluginSettingTab, Setting, debounce, normalizePath } from 'obsidian';
import type { App, ButtonComponent } from 'obsidian';
import type { PluginSettings, BrainSettings } from './types';
import BrainOS from './main'
import { FileSuggest, FolderSuggest, StatusSuggest } from './utils/suggesters';
import { StatusConfiguration, StatusType } from './utils';
import { PROJECT, RESOURCE } from './constants';
import { CustomStatusModal } from './modals/CustomStatusModal';

export function addNewOptionsToUserSettings<KeysAndValues>(defaultValues: KeysAndValues, userValues: KeysAndValues) {
  for (const flag in defaultValues) {
    if (userValues[flag] === undefined) {
      userValues[flag] = defaultValues[flag];
    }
  }
}
export const DEFAULT_SETTINGS: BrainSettings = {
  otherTemplates: "99 - Meta/00 - Templates/Other Templates",
  other_templates_frontmatter: "related_templates",
  para: {
    usePARANotes: true,
    projects: {
      folder: "01 - Projects",
      template: "99 - Meta/00 - Templates/PARA/project",
      prefix: "p-",
      status_frontmatter: "status",
      deadline_frontmatter: "deadline",
      priority_frontmatter: "priority",
      related_areas_frontmatter: "related_areas",
      related_templates_frontmatter: "related_templates",
      project_statuses: [],
    },
    areas: {
      folder: "02 - Areas",
      template: "99 - Meta/00 - Templates/PARA/area",
      prefix: "a-",
      priority_frontmatter: "priority",
      related_templates_frontmatter: "related_templates",
    },
    resources: {
      folder: "03 - Resources",
      template: "99 - Meta/00 - Templates/PARA/resources",
      prefix: "r-",
      related_templates_frontmatter: "related_templates",
      resource_statuses: [],
      status_frontmatter: "status",
    },
    archives: {
      folder: "06 - Archives",
      template: "99 - Meta/00 - Templates/PARA/archives"
    },
  },

  periodic: {
    usePeriodicNotes: true,
    periodicFolder: "00 - Periodic",
    daily: {
      projectListHeader: "Project List",
      template: "99 - Meta/00 - Templates/Periodic/daily",
      habitHeader: 'Habit',
      dailyRecordHeader: 'Daily Record',
    },
    weekly: { template: "99 - Meta/00 - Templates/Periodic/weekly" },
    monthly: { template: "99 - Meta/00 - Templates/Periodic/monthly" },
    quarterly: {
      template: "99 - Meta/00 - Templates/Periodic/quarterly",
      areaListHeader: 'First Things Dimension',
    },
    yearly: { template: "99 - Meta/00 - Templates/Periodic/yearly" },
  }
}

export class SettingTab extends PluginSettingTab {
  plugin: BrainOS;

  constructor(app: App, plugin: BrainOS) {
    super(app, plugin);
    this.plugin = plugin;
  }

  sanitiseNote(value: string): string | null {
    if (value === null || value.match(/^\s*$/) !== null) {
      return null;
    }
    return normalizePath(value);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Enable Periodic Notes')
      .setDesc('Whether to turn on Periodic Notes')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.periodic.usePeriodicNotes)
          .onChange(async (value) => {
            this.plugin.settings.periodic.usePeriodicNotes = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName('Enable PARA Notes')
      .setDesc('Whether to turn on PARA Notes')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.para.usePARANotes)
          .onChange(async (value) => {
            this.plugin.settings.para.usePARANotes = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );

    containerEl.createEl('h1', { text: 'Other Templates' });

    new Setting(containerEl)
      .setName('Other Templates Folder')
      .setDesc('for templates that can be used across different org systems')
      .addText((text) => {
        new FolderSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.otherTemplates)
          .setValue(this.plugin.settings.otherTemplates)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.otherTemplates = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    new Setting(containerEl)
      .setName('Other Templates Key:')
      .setDesc('the key that will be used to track the related_templates in the frontmatter')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.other_templates_frontmatter)
          .setValue(this.plugin.settings.other_templates_frontmatter)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.other_templates_frontmatter = value;
              await this.plugin.saveSettings();
            }, 500)
          )
      );

    if (this.plugin.settings.periodic.usePeriodicNotes) {

      this.periodicSettings()

    }


    if (this.plugin.settings.para.usePARANotes) {

      this.paraSettings()
    }
  }

  periodicSettings(): void {
    const { containerEl } = this

    containerEl.createEl('h1', { text: 'Periodic Notes Settings' });

    new Setting(containerEl)
      .setName('Periodic Notes Folder:')
      .addText((text) => {
        new FolderSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.periodicFolder)
          .setValue(this.plugin.settings.periodic.periodicFolder)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.periodicFolder = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    containerEl.createEl('h2', { text: 'Daily Note Settings' });
    new Setting(containerEl)
      .setName('Daily Template Path')
      .setDesc('This will be used as the template for the daily note')
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.daily.template)
          .setValue(this.plugin.settings.periodic.daily.template)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.daily.template = value;
              await this.plugin.saveSettings();
            }, 500))
      })

    new Setting(containerEl)
      .setName('Habit Header:')
      .setDesc('Where the Habit module is in a daily note')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.daily.habitHeader)
          .setValue(this.plugin.settings.periodic.daily.habitHeader)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.daily.habitHeader = value;
              await this.plugin.saveSettings();
            }, 500)
          )
      );


    new Setting(containerEl)
      .setName('Daily Record Header:')
      .setDesc('the name of the daily record section')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.daily.dailyRecordHeader)
          .setValue(this.plugin.settings.periodic.daily.dailyRecordHeader)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.daily.dailyRecordHeader = value;
              await this.plugin.saveSettings();
            }, 500)
          )
      );
    new Setting(containerEl)
      .setName('Project List Header:')
      .setDesc('Where the Project List is in a daily note')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.daily.projectListHeader)
          .setValue(this.plugin.settings.periodic.daily.projectListHeader)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.daily.projectListHeader = value;
              await this.plugin.saveSettings();
            }, 500)
          )
      );


    containerEl.createEl('h2', { text: 'Weekly Note Settings' });
    new Setting(containerEl)
      .setName('Weekly Template Path')
      .setDesc('This will be used as the template for the weekly note')
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.weekly.template)
          .setValue(this.plugin.settings.periodic.weekly.template)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.weekly.template = value;
              await this.plugin.saveSettings();
            }, 500))
      })

    containerEl.createEl('h2', { text: 'Monthly Note Settings' });
    new Setting(containerEl)
      .setName('Monthly Template Path')
      .setDesc('This will be used as the template for the monthly note')
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.monthly.template)
          .setValue(this.plugin.settings.periodic.monthly.template)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.monthly.template = value;
              await this.plugin.saveSettings();
            }, 500))
      })


    containerEl.createEl('h2', { text: 'Quarterly Note Settings' });
    new Setting(containerEl)
      .setName('Quarterly Template Path')
      .setDesc('This will be used as the template for the quarterly note')
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.quarterly.template)
          .setValue(this.plugin.settings.periodic.quarterly.template)
          .onChange(
            debounce(async (value) => {
              await this.plugin.saveSettings();
              this.plugin.settings.periodic.quarterly.template = value;
            }, 500))
      })

    new Setting(containerEl)
      .setName('Area List Header:')
      .setDesc('Where the Area List is in a quarterly note')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.quarterly.areaListHeader)
          .setValue(this.plugin.settings.periodic.quarterly.areaListHeader)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.quarterly.areaListHeader = value;
              await this.plugin.saveSettings();
            }, 500)
          )
      );

    containerEl.createEl('h2', { text: 'Yearly Note Settings' });
    new Setting(containerEl)
      .setName('Yearly Template Path')
      .setDesc('This will be used as the template for the yearly note')
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.periodic.yearly.template)
          .setValue(this.plugin.settings.periodic.yearly.template)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.periodic.yearly.template = value;
              await this.plugin.saveSettings();
            }, 500))
      })
  }

  paraSettings(): void {

    const { containerEl } = this

    containerEl.createEl('h1', { text: 'P.A.R.A' });

    containerEl.createEl('h2', { text: 'Project Settings' });
    new Setting(containerEl)
      .setName('Projects Folder:')
      .setDesc('Where all your projects will be placed')
      .addText((text) => {
        new FolderSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.projects.folder)
          .setValue(this.plugin.settings.para.projects.folder)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.projects.folder = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    new Setting(containerEl)
      .setName('Project Template:')
      .setDesc("The template for the project's README file")
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.projects.template)
          .setValue(this.plugin.settings.para.projects.template)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.projects.template = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    new Setting(containerEl)
      .setName('Project Deadline key')
      .setDesc('the key that will be used to track the deadline of the project in the frontmatter')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.projects.deadline_frontmatter)
          .setValue(this.plugin.settings.para.projects.deadline_frontmatter)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.projects.deadline_frontmatter = value;
              await this.plugin.saveSettings();
            }, 500)))

    new Setting(containerEl)
      .setName('Project Related Areas key')
      .setDesc('the key that will be used to track the related areas of the project in the frontmatter')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.projects.related_areas_frontmatter)
          .setValue(this.plugin.settings.para.projects.related_areas_frontmatter)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.projects.related_areas_frontmatter = value;
              await this.plugin.saveSettings();
            }, 500)))

    new Setting(containerEl)
      .setName('Project Priority key')
      .setDesc('the key that will be used to track the priority of the project in the frontmatter')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.projects.priority_frontmatter)
          .setValue(this.plugin.settings.para.projects.priority_frontmatter)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.projects.priority_frontmatter = value;
              await this.plugin.saveSettings();
            }, 500)))

    new Setting(containerEl)
      .setName('Project Status key')
      .setDesc('the key that will be used to track the status of the project in the frontmatter')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.projects.status_frontmatter)
          .setValue(this.plugin.settings.para.projects.status_frontmatter)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.projects.status_frontmatter = value;
              await this.plugin.saveSettings();
            }, 500)))

    new Setting(containerEl)
      .setName("Add new project status")
      .setDesc("these statuses will be used in lifecycle of the project")
      .addButton((button: ButtonComponent) => {
        button
          .setTooltip("Add additional folder template")
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            const modal = new CustomStatusModal(this.plugin, new StatusConfiguration("", StatusType.NEW), PROJECT, `New ${PROJECT.toLowerCase()} status`)

            modal.onClose = async () => {
              if (modal.saved) {

                const newStatus = modal.statusConfiguration()
                this.plugin.settings.para.projects.project_statuses.push({
                  id: `${newStatus.name}-${newStatus.type}`,
                  name: newStatus.name,
                  type: newStatus.type,
                  default: newStatus.default_status,
                })

                this.plugin.saveSettings();
                this.display();
              }

            };

            modal.open();
          });
      });

    this.plugin.settings.para.projects.project_statuses.forEach((project_status, index) => {
      const infoDiv = containerEl.createDiv()
      infoDiv.addClasses(["flex", "flex-row", "gap-4", "items-center"])
      const name = infoDiv.createSpan()
      name.setText(`NAME: ${project_status.name}`)
      name.addClasses(["text-magnum-700"])
      const type = infoDiv.createSpan()
      type.setText(`TYPE: ${project_status.type}`)
      type.addClasses(["text-magnum-900"])
      if (project_status.default) {
        // TODO: see if its possible to create a chip in the settings tab
        // const div = infoDiv.createDiv()
        // div.addClasses(["relative", "grid", "select-none", "items-center",
        //   "whitespace-nowrap", "rounded-lg", "bg-magnum-900", "py-1.5", "px-3",
        //   "text-xs", "font-bold", "uppercase", "text-white"])
        const type = infoDiv.createSpan()
        type.setText(`DEFAULT`)
        type.addClasses(["text-magnum-700", "rounded-lg", "bg-gray-200", "py-2", "px-3", "items-center", "text-sm"])

      }
      const info = new DocumentFragment()
      info.append(infoDiv)
      const status = new Setting(containerEl)
        .setName(info)
        .setDesc(`ID: ${project_status.name}-${project_status.type}`)
        .addExtraButton((cb) => {
          cb.setIcon("pencil")
            .setTooltip("Modify")
            .onClick(() => {
              const modal = new CustomStatusModal(this.plugin, new StatusConfiguration(project_status.name, project_status.type, project_status.default), PROJECT, `${PROJECT.toLowerCase()} status`)

              modal.onClose = async () => {
                if (modal.saved) {

                  const newStatus = modal.statusConfiguration()

                  this.plugin.settings.para.projects.project_statuses[index].type = newStatus.type;
                  this.plugin.settings.para.projects.project_statuses[index].name = newStatus.name;
                  this.plugin.settings.para.projects.project_statuses[index].id = `${newStatus.name}-${newStatus.type}`
                  this.plugin.settings.para.projects.project_statuses[index].default = newStatus.default_status
                  this.plugin.saveSettings();
                  this.display();
                }

              };

              modal.open();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(() => {
              this.plugin.settings.para.projects.project_statuses.splice(
                index,
                1
              );
              this.plugin.saveSettings();
              this.display();
            });
        });
    })


    containerEl.createEl('h2', { text: 'Area Settings' });
    new Setting(containerEl)
      .setName('Area Folder:')
      .setDesc('Where all your areas of interest will be placed')
      .addText((text) => {
        new FolderSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.areas.folder)
          .setValue(this.plugin.settings.para.areas.folder)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.areas.folder = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    new Setting(containerEl)
      .setName('Area Priority key')
      .setDesc('the key that will be used to track the priority of the area in the frontmatter')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.areas.priority_frontmatter)
          .setValue(this.plugin.settings.para.areas.priority_frontmatter)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.areas.priority_frontmatter = value;
              await this.plugin.saveSettings();
            }, 500)))

    new Setting(containerEl)
      .setName('Area Template:')
      .setDesc("The template for the area's README file")
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.areas.template)
          .setValue(this.plugin.settings.para.areas.template)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.areas.template = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    new Setting(containerEl)
      .setName('Area Prefix')
      .setDesc('This will be used to differentiate area tags from other tags in your vault')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.areas.prefix)
          .setValue(this.plugin.settings.para.areas.prefix)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.areas.prefix = value;
              await this.plugin.saveSettings();
            }, 500)))

    containerEl.createEl('h2', { text: 'Resource Settings' });
    new Setting(containerEl)
      .setName('Resources Folder:')
      .setDesc('Where all your resources will be placed')
      .addText((text) => {
        new FolderSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.resources.folder)
          .setValue(this.plugin.settings.para.resources.folder)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.resources.folder = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    new Setting(containerEl)
      .setName('Resource Template:')
      .setDesc("The template for the resource's README file \n think of it as the resource type (article, books, videos, etc)")
      .addText((text) => {
        new FileSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.resources.template)
          .setValue(this.plugin.settings.para.resources.template)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.resources.template = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

    new Setting(containerEl)
      .setName('Resource Prefix')
      .setDesc('This will be used to differentiate resource tags from other tags in your vault')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.resources.prefix)
          .setValue(this.plugin.settings.para.resources.prefix)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.resources.prefix = value;
              await this.plugin.saveSettings();
            }, 500)))


    new Setting(containerEl)
      .setName('Resource Status key')
      .setDesc('the key that will be used to track the status of a given resource of a certian resource type in the frontmatter')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.resources.status_frontmatter)
          .setValue(this.plugin.settings.para.resources.status_frontmatter)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.resources.status_frontmatter = value;
              await this.plugin.saveSettings();
            }, 500)))

    new Setting(containerEl)
      .setName("Add new Resource status")
      .setDesc("these statuses will be used in lifecycle of a resource of a certain resource type")
      .addButton((button: ButtonComponent) => {
        button
          .setTooltip("Add additional resource status")
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            const modal = new CustomStatusModal(this.plugin, new StatusConfiguration("", StatusType.NEW), RESOURCE, `New ${RESOURCE.toLowerCase()} status`)

            modal.onClose = async () => {
              if (modal.saved) {

                const newStatus = modal.statusConfiguration()
                this.plugin.settings.para.resources.resource_statuses.push({
                  id: `${newStatus.name}-${newStatus.type}`,
                  name: newStatus.name,
                  type: newStatus.type,
                  default: newStatus.default_status,
                })

                this.plugin.saveSettings();
                this.display();
              }

            };

            modal.open();
          });
      });

    this.plugin.settings.para.resources.resource_statuses.forEach((resource_status, index) => {
      const infoDiv = containerEl.createDiv()
      infoDiv.addClasses(["flex", "flex-row", "gap-4", "items-center"])
      const name = infoDiv.createSpan()
      name.setText(`NAME: ${resource_status.name}`)
      name.addClasses(["text-magnum-700"])
      const type = infoDiv.createSpan()
      type.setText(`TYPE: ${resource_status.type}`)
      type.addClasses(["text-magnum-900"])
      if (resource_status.default) {
        const type = infoDiv.createSpan()
        type.setText(`DEFAULT`)
        type.addClasses(["text-magnum-700", "rounded-lg", "bg-gray-200", "py-2", "px-3", "items-center", "text-sm"])
      }
      const info = new DocumentFragment()
      info.append(infoDiv)
      new Setting(containerEl)
        .setName(info)
        .setDesc(`ID: ${resource_status.name}-${resource_status.type}`)
        .addExtraButton((cb) => {
          cb.setIcon("pencil")
            .setTooltip("Modify")
            .onClick(() => {
              const modal = new CustomStatusModal(this.plugin, new StatusConfiguration(resource_status.name,
                resource_status.type, resource_status.default), RESOURCE, `New ${RESOURCE.toLowerCase()} status`)

              modal.onClose = async () => {
                if (modal.saved) {

                  const newStatus = modal.statusConfiguration()

                  this.plugin.settings.para.resources.resource_statuses[index].type = newStatus.type;
                  this.plugin.settings.para.resources.resource_statuses[index].name = newStatus.name;
                  this.plugin.settings.para.resources.resource_statuses[index].id = `${newStatus.name}-${newStatus.type}`
                  this.plugin.settings.para.resources.resource_statuses[index].default = newStatus.default_status
                  this.plugin.saveSettings();
                  this.display();
                }

              };

              modal.open();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(() => {
              this.plugin.settings.para.resources.resource_statuses.splice(
                index,
                1
              );
              this.plugin.saveSettings();
              this.display();
            });
        });
    });


    containerEl.createEl('h2', { text: 'Archive Settings' });
    new Setting(containerEl)
      .setName('Archives Folder:')
      .setDesc('Where all your archives will be placed')
      .addText((text) => {
        new FolderSuggest(this.app, text.inputEl);
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.archives.folder)
          .setValue(this.plugin.settings.para.archives.folder)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.archives.folder = value;
              await this.plugin.saveSettings();
            }, 500))
      }
      );

  }

}
