import { Component, MarkdownRenderer, Notice, TFile, moment } from 'obsidian';
import type { App } from 'obsidian';
import dayjs, { Dayjs } from 'dayjs';
import { pluginStore } from '../stores';
import { get } from 'svelte/store'
import { createFile } from './files';
import { DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY } from '../constants';

export async function createPeriodicFile(
  day: Dayjs,
  periodType: string,
  periodicNotesPath: string,
  templatePath: string,
): Promise<void> {

  const app = get(pluginStore.app)
  if (!app || !periodicNotesPath) {
    return;
  }

  const locale = window.localStorage.getItem('language') || 'en';
  const date = dayjs(day.format()).locale(locale);

  let templateFile = '';
  let folder = '';
  let file = '';

  const year = date.format('YYYY');
  let value: string = '';

  if (periodType === DAILY) {
    folder = `${periodicNotesPath}/${year}/${periodType}/${String(
      date.month() + 1
    ).padStart(2, '0')}`;
    value = date.format('YYYY-MM-DD');
  } else if (periodType === WEEKLY) {
    folder = `${periodicNotesPath}/${date.format('gggg')}/${periodType}`;
    value = date.format('gggg-[W]ww');
  } else if (periodType === MONTHLY) {
    folder = `${periodicNotesPath}/${year}/${periodType}`;
    value = date.format('YYYY-MM');
  } else if (periodType === QUARTERLY) {
    folder = `${periodicNotesPath}/${year}/${periodType}`;
    value = date.format('YYYY-[Q]Q');
  } else if (periodType === YEARLY) {
    folder = `${periodicNotesPath}/${year}`;
    value = year;
  }

  file = `${folder}/${value}.md`;
  // templateFile = `${periodicNotesPath}/Templates/${periodType}.md`;
  templateFile = `${templatePath}/${periodType}.md`;

  await createFile(app, {
    locale,
    templateFile,
    folder,
    file,
  });
}
