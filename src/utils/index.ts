import { Component, MarkdownRenderer } from 'obsidian';
import type { App } from 'obsidian';
import { createFile } from './files.ts'
import { createPeriodicFile } from './periodic.ts';





function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function renderError(
  app: App,
  msg: string,
  containerEl: HTMLElement,
  sourcePath: string
) {

  const component = new Component();

  return MarkdownRenderer.render(app, msg, containerEl, sourcePath, component);
}


export default {
  sleep, renderError,
  createFile, createPeriodicFile
}

