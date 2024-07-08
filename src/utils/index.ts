import { Component, MarkdownRenderer, Notice, TFile, moment } from "obsidian";
import type { App } from "obsidian";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createFile, findTemplateFiles } from "./files"
import { createPeriodicFile } from "./periodic";
import { createPARAFile, generateHeaderRegExp } from "./para";
import { LogLevel, type Tag } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function tagExists(tags: Tag[], tag: string) {

  return tags.some(tagItem => tagItem.value === tag)
}

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


export function logMessage(message: string, level: LogLevel = LogLevel.info) {
  new Notice(message, 5000);

  if (level === LogLevel.info) {
    console.info(message);
  } else if (level === LogLevel.warn) {
    console.warn(message);
  } else if (level === LogLevel.error) {
    console.error(message);
    throw Error(message);
  }
}


export {
  sleep, renderError,
  createFile, findTemplateFiles,
  createPeriodicFile,
  createPARAFile, generateHeaderRegExp,
  cn, tagExists,
}

