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



export type PeriodicType = {
  usePeriodicNotes: boolean;
  daily: {
    template: string;
    folder: string; // should be path
  }
  weekly: {
    template: string;
    folder: string; // should be path
  }
  monthly: {
    template: string;
    folder: string; // should be path
  }
  quarterly: {
    template: string;
    folder: string; // should be path
  }

  yearly: {
    template: string;
    folder: string; // should be path
  }
}
