import { Component, MarkdownRenderer, Notice, TFile } from 'obsidian';
import type { App } from 'obsidian';
import dayjs, { Dayjs } from 'dayjs';
import { createFile } from './files';
import moment from 'moment';
import { DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY } from '../constants';

export async function createPeriodicFile(
  day: Dayjs,
  periodType: string,
  periodicNotesPath: string,
  templatePath: string,
  app: App
): Promise<void> {
  if (!app || !periodicNotesPath) {
    return;
  }

  const locale = window.localStorage.getItem('language') || 'en';
  const bate = dayjs(day.format()).locale(locale);
  const date = moment(bate.format("YYYY-MM-DD"))
  console.log(date)

  let templateFile = '';
  let folder = '';
  let file = '';

  const year = date.format('YYYY');
  let value = '';

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
    console.log(value)
  } else if (periodType === YEARLY) {
    folder = `${periodicNotesPath}/${year}`;
    value = year;
  }

  file = `${folder}/${value}.md`;
  // templateFile = `${periodicNotesPath}/Templates/${periodType}.md`;
  templateFile = `${templatePath}.md`;

  await createFile(app, {
    locale,
    templateFile,
    folder,
    file,
  });
}
