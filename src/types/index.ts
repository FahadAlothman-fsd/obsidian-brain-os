import type { PARAType as paraType } from "./paraTypes";
import type { PeriodicType as periodicType } from "./periodicTypes";

export interface PluginSettings {
  templatePath: string;
  periodicNotesPath: string;
  projectsPath: string;
  areasPath: string;
  resourcesPath: string;
  archivesPath: string;
  projectListHeader: string;
  areaListHeader: string;
  habitHeader: string;
  dailyRecordHeader: string;
  // dailyRecordAPI: string;
  // dailyRecordToken: string;
  useDailyRecord: boolean;
  usePeriodicNotes: boolean;
  usePARANotes: boolean;
}

export type TabsType = {
  id: string;
  title: string;
  icon: string;
  component: any;
}[];

export type Tag = {
  value: string;
  count: number;
};


export interface BrainSettings {
  para: paraType
  periodic: periodicType
}




export enum LogLevel {
  'info',
  'warn',
  'error',
}
