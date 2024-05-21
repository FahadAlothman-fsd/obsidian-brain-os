
export type PARAType = {
  // templatePath: string; // should make sure its a path
  // projectsPath: string; // should be a path 
  // areasPath: string; // should be a path
  // resourcesPath: string; //should be a path

  usePARANotes: boolean;
  projects: {
    template: string; // README.md file
    folder: string; // should be path
  }
  areas: {
    template: string; // README.md file
    folder: string; // should be path
  }
  resources: {
    template: string; // README.md file
    folder: string; // should be path
  }
  archives: {
    template: string; // README.md file
    folder: string; // should be path
  }
}

