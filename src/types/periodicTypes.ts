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
  periodicFolder: string // should be path
  daily: {
    projectListHeader: string
    template: string; // should be path
    habitHeader: string;
    dailyRecordHeader: string;
  }
  weekly: {
    template: string; // should be path
  }
  monthly: {
    template: string; // should be path
  }
  quarterly: {
    template: string; // should be path
    areaListHeader: string;
  }
  yearly: {
    template: string; // should be path
  }
}
