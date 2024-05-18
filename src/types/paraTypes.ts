
export type PARAType = {
  // templatePath: string; // should make sure its a path
  // projectsPath: string; // should be a path 
  // areasPath: string; // should be a path
  // resourcesPath: string; //should be a path
  projects: {
    template: string;
    folder: string; // should be path
  }
  areas: {
    template: string;
    folder: string; // should be path
  }
  resources: {
    template: string;
    folder: string; // should be path
  }
  archives: {
    template: string;
    folder: string; // should be path
  }
}

