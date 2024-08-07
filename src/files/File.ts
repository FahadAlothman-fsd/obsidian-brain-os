// TODO: refactor this to fit the BrainOS structre and workflow
import { App, type MarkdownPostProcessorContext, TFile, TFolder } from 'obsidian';
import type { BrainSettings } from '../types';
import {
  DAILY_REG,
  WEEKLY_REG,
  MONTHLY_REG,
  QUARTERLY_REG,
  YEARLY_REG,
  ERROR_MESSAGE,
} from '../constants';
import { DataviewApi } from 'obsidian-dataview';
import { logMessage, renderError } from '../utils';
import { Markdown } from './Markdown';
import { I18N_MAP } from '../i18n';

export class File {
  app: App;
  date?: Date;
  settings: BrainSettings;
  dataview: DataviewApi;
  locale: string;
  constructor(
    app: App,
    settings: BrainSettings,
    dataview: DataviewApi,
    locale: string
  ) {
    this.app = app;
    this.settings = settings;
    this.dataview = dataview;
    this.locale = locale;
  }

  private hasCommonPrefix(tags1: string[], tags2: string[]) {
    for (const tag1 of tags1) {
      for (const tag2 of tags2) {
        if (tag1.startsWith(tag2)) {
          return true;
        }
      }
    }
    return false;
  }

  getAllFilesInFolder(fileFolder: string) {
    const folder = this.app.vault.getAbstractFileByPath(fileFolder)

    if (folder instanceof TFolder) {
      const subFolderList = folder.children
        .sort()
        .filter((file) => file instanceof TFolder);
      const IndexList = subFolderList
        .map((subFolder) => {
          // 优先搜索同名文件，否则搜索 XXX.README
          if (subFolder instanceof TFolder) {
            const { name } = subFolder;
            const files = subFolder.children;
            const indexFile = files.find((file) => {
              if ((file as any).basename === name) {
                return true;
              }
              if (file.path.match(/(.*\.)?README\.md/)) {
                return true;
              }
            });


            if (!indexFile) {
              logMessage(
                `${I18N_MAP[this.locale][`${ERROR_MESSAGE}}NO_INDEX_FILE_EXIST`]} @ ${subFolder.path}`
              );
            }

            if (indexFile instanceof TFile) {
              return { link: indexFile.path, name: subFolder.name, id: indexFile.path.replace('/', '-') }
            }
          }
        })
        .filter((link) => !!link)

      return IndexList;
    }
  }
  list(fileFolder: string, condition: { tags: string[] } = { tags: [] }) {
    const folder = this.app.vault.getAbstractFileByPath(fileFolder);

    if (folder instanceof TFolder) {
      const subFolderList = folder.children
        .sort()
        .filter((file) => file instanceof TFolder);
      const IndexList = subFolderList
        .map((subFolder) => {
          // 优先搜索同名文件，否则搜索 XXX.README
          if (subFolder instanceof TFolder) {
            const { name } = subFolder;
            const files = subFolder.children;
            const indexFile = files.find((file) => {
              if ((file as any).basename === name) {
                return true;
              }
              if (file.path.match(/(.*\.)?README\.md/)) {
                return true;
              }
            });

            if (condition.tags.length) {
              const tags = this.tags(indexFile?.path || '');
              // tags: #work/project-1 #work/project-2
              // condition.tags: #work
              if (!this.hasCommonPrefix(tags, condition.tags)) {
                return '';
              }
            }

            if (!indexFile) {
              logMessage(
                `${I18N_MAP[this.locale][`${ERROR_MESSAGE}}NO_INDEX_FILE_EXIST`]} @ ${subFolder.path}`
              );
            }

            if (indexFile instanceof TFile) {
              const link = this.app.metadataCache.fileToLinktext(
                indexFile,
                indexFile?.path
              );
              return `[[${link}|${subFolder.name}]]`;
            }
          }
        })
        .filter((link) => !!link)
        .map((link, index: number) => `${index + 1}. ${link}`);

      return IndexList;
    }

    return [`No files in ${fileFolder}`];
  }

  get(link: string, sourcePath = '', fileFolder?: string) {
    const file = this.app.metadataCache.getFirstLinkpathDest(link, sourcePath);

    if (!fileFolder) {
      return file;
    }

    if (file?.path.includes(fileFolder)) {
      return file;
    }
  }

  tags(filePath: string) {
    const file = this.app.vault.getAbstractFileByPath(filePath);

    if (file instanceof TFile) {
      const { frontmatter } = this.app.metadataCache.getFileCache(file) || {
        frontmatter: {},
      };

      let tags = frontmatter?.tags;

      if (!tags) {
        return [];
      }

      if (typeof tags === 'string') {
        tags = [tags];
      }

      return tags.map((tag: string) => tag.replace(/^#(.*)$/, '$1'));
    }
  }

  listByTag = async (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) => {
    const filepath = ctx.sourcePath;
    const tags = this.tags(filepath);
    const div = el.createEl('div');
    const filesDiv = div.createEl('div')
    const tagsDiv = div.createEl('div')
    const filesHeader = filesDiv.createEl('h4')
    filesHeader.textContent = "In PARA folder"
    const tagsHeader = tagsDiv.createEl('h4')
    tagsHeader.textContent = "By PARA Tag"
    const component = new Markdown(div);
    const periodicNotesPath = this.settings.periodic.periodicFolder;

    if (!tags.length) {
      return renderError(
        this.app,
        I18N_MAP[this.locale][`${ERROR_MESSAGE}}NO_FRONT_MATTER_TAG`],
        div,
        filepath
      );
    }

    const from = tags
      .map((tag: string[], index: number) => {
        return `#${tag} ${index === tags.length - 1 ? '' : 'OR'}`;
      })
      .join(' ')
      .trim();

    this.dataview.table(
      ['File', 'Date'],
      this.dataview
        .pages(from)
        .filter(
          (b: any) =>
            !b.file.name?.match(YEARLY_REG) &&
            !b.file.name?.match(QUARTERLY_REG) &&
            !b.file.name?.match(MONTHLY_REG) &&
            !b.file.name?.match(WEEKLY_REG) &&
            !b.file.name?.match(DAILY_REG) &&
            !b.file.name?.match(/Template$/) &&
            !b.file.path?.includes(`${periodicNotesPath}/Templates`) &&
            b.file.path !== filepath
        )
        .sort((b: any) => b.file.ctime, 'desc')
        .map((b: any) => [
          b.file.link,
          `[[${window.moment(b.file.ctime.ts).format('YYYY-MM-DD')}]]`,
        ]),
      filesDiv,
      component,
      filepath
    );


    this.dataview.table(
      ['File', 'Date'],
      this.dataview
        .pages(from)
        .filter(
          (b: any) =>
            !b.file.name?.match(YEARLY_REG) &&
            !b.file.name?.match(QUARTERLY_REG) &&
            !b.file.name?.match(MONTHLY_REG) &&
            !b.file.name?.match(WEEKLY_REG) &&
            !b.file.name?.match(DAILY_REG) &&
            !b.file.name?.match(/Template$/) &&
            !b.file.path?.includes(`${periodicNotesPath}/Templates`) &&
            b.file.path !== filepath
        )
        .sort((b: any) => b.file.ctime, 'desc')
        .map((b: any) => [
          b.file.link,
          `[[${window.moment(b.file.ctime.ts).format('YYYY-MM-DD')}]]`,
        ]),
      tagsDiv,
      component,
      filepath
    );

    ctx.addChild(component);
  };
}
