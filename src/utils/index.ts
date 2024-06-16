import { Component, MarkdownRenderer } from "obsidian";
import type { App } from "obsidian";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createFile } from "./files"
import { createPeriodicFile } from "./periodic";
import { createPARAFile } from "./para";
import type { Tag } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tagExists(tags: Tag[], tag: string) {

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


export default {
  sleep, renderError,
  createFile, createPeriodicFile, createPARAFile,
}

