import { Component, MarkdownRenderer, Notice, TFile, moment } from 'obsidian';
import type { App } from 'obsidian';
import dayjs, { Dayjs } from 'dayjs';
import { I18N_MAP } from '../i18n';
import { ERROR_MESSAGE } from '../constants';


export function trimFile(file: TFile): string {
  if (!file) return "";
  return file.extension == "md" ? file.path.slice(0, -3) : file.path;
}

export async function createFile(
  app: App,
  options: {
    locale: string;
    templateFile: string;
    folder: string;
    file: string;
    tag?: string;
  }
) {

  if (!app) {
    return;
  }

  const { templateFile, folder, file, tag, locale } = options;
  const templateTFile = app.vault.getAbstractFileByPath(templateFile!);

  if (!templateTFile) {
    return new Notice(
      I18N_MAP[locale][`${ERROR_MESSAGE}NO_TEMPLATE_EXIST`] + templateFile
    );
  }

  if (templateTFile instanceof TFile) {
    const templateContent = await app.vault.cachedRead(templateTFile);

    if (!folder || !file) {
      return;
    }

    const tFile = app.vault.getAbstractFileByPath(file);

    if (tFile && tFile instanceof TFile) {
      return await app.workspace.getLeaf().openFile(tFile);
    }

    if (!app.vault.getAbstractFileByPath(folder)) {
      app.vault.createFolder(folder);
    }

    const fileCreated = await app.vault.create(file, templateContent);

    await app.fileManager.processFrontMatter(fileCreated, (frontMatter) => {
      if (!tag) {
        return;
      }

      frontMatter.tags = frontMatter.tags || [];
      frontMatter.tags.push(tag.replace(/^#/, ''));
    });
    await sleep(30); // 等待被索引，否则读取不到 frontmatter：this.app.metadataCache.getFileCache(file)
    await app.workspace.getLeaf().openFile(fileCreated);
  }
}
