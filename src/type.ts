import type { App } from 'obsidian';


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

type PARAType = {
  templatePath: string; // should make sure its a path
  projectsPath: string; // should be a path 
  areasPath: string; // should be a path
  resourcesPath: string; //should be a path

}
