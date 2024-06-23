import { Component, MarkdownRenderer, Notice, TFile } from 'obsidian';
import type { App } from 'obsidian';
import { createFile } from './files';
import { DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY } from '../constants';
import { getLocalTimeZone, type DateValue } from '@internationalized/date';
import type { Moment } from 'moment';

export async function createPeriodicFile(
  day: Moment,
  periodType: string,
  periodicNotesPath: string,
  templatePath: string,
  app: App
): Promise<void> {
  if (!app || !periodicNotesPath) {
    return;
  }

  const locale = window.localStorage.getItem('language') || 'en';
  const date = window.moment(day.format("YYYY-MM-DD"))
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




export function getISOWeekNumber(date: DateValue) {

  const locale = window.moment().locale()
  const dateMoment = window.moment(date.toDate(getLocalTimeZone()))
  const weekNum = dateMoment.format('w')
  return weekNum;
}