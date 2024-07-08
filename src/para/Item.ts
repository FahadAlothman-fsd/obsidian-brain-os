// TODO: refactor this to fit the BrainOS structre and workflow
import {
  type App,
  type MarkdownPostProcessorContext,
  MarkdownRenderer,
} from 'obsidian';
import type { BrainSettings } from '../types';
import { Date } from '../periodic';
import { File, Markdown } from '../files';

export class Item {
  dir: string;
  app: App;
  settings: BrainSettings;
  file: File;
  date: Date;
  locale: string;

  constructor(dir: string, app: App, settings: BrainSettings, file: File, locale: string) {
    this.dir = dir;
    this.app = app;
    this.settings = settings;
    this.file = file;
    this.locale = locale;
    this.date = new Date(this.app, this.settings, this.file, locale);
  }

  snapshot(dir = this.dir) {
    return this.file.list(dir).join('\n');
  }

  getAllPARAFiles = async (dir = this.dir) => {

    const files = this.file.getAllFilesInFolder(dir)
    return files ?? []
  }

  listByFolder = async (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) => {
    const div = el.createEl('div');
    const markdown = this.file.list(this.dir).join('\n');
    const component = new Markdown(div);

    MarkdownRenderer.render(
      this.app,
      markdown || '- Nothing',
      div,
      ctx.sourcePath,
      component
    );

    ctx.addChild(component);
  };

  listByTag = async (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) => {
    const filepath = ctx.sourcePath;
    const tags = this.file.tags(filepath);
    const div = el.createEl('div');
    const markdown = this.file.list(this.dir, { tags }).join('\n');
    const component = new Markdown(div);

    MarkdownRenderer.render(
      this.app,
      markdown || '- Nothing',
      div,
      ctx.sourcePath,
      component
    );

    ctx.addChild(component);
  };
}
