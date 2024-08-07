import { PluginSettingTab, Setting, debounce, normalizePath } from 'obsidian';
import type { App } from 'obsidian';
import type { PluginSettings, BrainSettings } from './types';
import BrainOS from './main'
import { FileSuggest, FolderSuggest } from './utils/suggesters';


export const DEFAULT_SETTINGS: BrainSettings = {
  otherTemplates: "99 - Meta/00 - Templates/Other Templates",
  otherTemplatesHeader: "Related Templates",
  para: {
    usePARANotes: true,
    projects: {
      folder: "01 - Projects",
      template: "99 - Meta/00 - Templates/PARA/project",
      prefix: "p-"
    },
    areas: {
      folder: "02 - Areas",
      template: "99 - Meta/00 - Templates/PARA/area",
      prefix: "a-"
    },
    resources: {
      folder: "03 - Resources",
      template: "99 - Meta/00 - Templates/PARA/resources",
      prefix: "r-"
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
      .setName('Other Templates Header:')
      .setDesc('Where the Other templates module is in a PARA README file')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.otherTemplatesHeader)
          .setValue(this.plugin.settings.otherTemplatesHeader)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.otherTemplatesHeader = value;
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
      .setName('Project Prefix')
      .setDesc('This will be used to differentiate project tags from other tags in your vault')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.para.projects.prefix)
          .setValue(this.plugin.settings.para.projects.prefix)
          .onChange(
            debounce(async (value) => {
              this.plugin.settings.para.projects.prefix = value;
              await this.plugin.saveSettings();
            }, 500)))

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
