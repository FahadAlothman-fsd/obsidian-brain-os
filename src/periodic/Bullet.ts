// TODO: refactor this to fit the BrainOS structre and workflow
import type { App, MarkdownPostProcessorContext } from 'obsidian';
import { type BrainSettings } from '../types';
import { Markdown } from '../files';
import { DataArray, DataviewApi, Link, type SListEntry } from 'obsidian-dataview';

import { File } from '../files';
import { ERROR_MESSAGE } from '../constants';
import { renderError } from '../utils';
import { I18N_MAP } from '../i18n';

export class Bullet {
  app: App;
  file: File;
  dataview: DataviewApi;
  settings: BrainSettings;
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
    this.file = new File(this.app, this.settings, this.dataview, locale);
  }

  listByTag = async (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) => {
    const filepath = ctx.sourcePath;
    const tags = this.file.tags(filepath);
    const div = el.createEl('div');
    const component = new Markdown(div);
    const periodicNotesPath = this.settings.periodic.periodicFolder;

    if (!tags.length) {
      return renderError(
        this.app,
        I18N_MAP[this.locale][`${ERROR_MESSAGE}NO_FRONT_MATTER_TAG`],
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
    const lists: DataArray<SListEntry> = await this.dataview.pages(
      `(${from}) and -"${periodicNotesPath}/Templates"`
    ).file.lists;
    const result: SListEntry = lists.where((L: SListEntry) => {
      let includeTag = false;
      if (L.task || L.path === filepath) return false;
      for (const tag of tags) {
        includeTag = L.tags.includes(`#${tag}`);
        if (includeTag) {
          break;
        }
      }
      return includeTag;
    });
    const groupResult = result.groupBy((elem: SListEntry) => {
      return elem.link;
    });
    const sortResult = groupResult.sort((elem: SListEntry) => elem.rows.link as Link, 'desc');
    const tableResult = sortResult.map((k: SListEntry) => [
      k.rows.text as string,
      k.rows.link as Link,
    ]);
    const tableValues = tableResult.array();

    this.dataview.table(
      ['Bullet', 'Link'],
      tableValues,
      div,
      component,
      filepath
    );

    ctx.addChild(component);
  };
}
