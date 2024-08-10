<script lang="ts">
  import { Circle3 } from "svelte-loading-spinners";
  import { get, writable } from "svelte/store";
  import { form, field } from "svelte-forms";
  import { min, required } from "svelte-forms/validators";
  import {
    plugin,
    ProjectEntryStore,
    projectStore,
    tagsStore,
  } from "../../../stores";
  import { Status, tagExists } from "../../../utils";
  import {
    StatusComboBox,
    AreasComboBox,
    Input,
    TagInput,
    TemplateInput,
  } from "../../UI";
  import { createPARAFile, type createPARADataType } from "../../../utils/para";
  import { PROJECT } from "../../../constants";
  import DateField from "../../UI/DateField.svelte";
  import type { ProjectEntryType } from "../../../types/paraTypes";
  import { CalendarDate } from "@internationalized/date";
  import { TFile } from "obsidian";

  export let project: ProjectEntryType | undefined;

  $: console.log(project);

  type relatedAreaType = {
    tag: string;
    priority: string;
  };

  // TODO: make sure that the user picks an area first, right now if they don't pick anything they can still put dumb shit
  const projectTag = field(
    "project_tag",
    project ? project.tag : "",
    [required()],
    {
      validateOnChange: true,
    },
  );

  const projectFolder = field(
    "project_folder",
    project ? project.folder_name?.name : "",
    [required()],
    {
      validateOnChange: true,
    },
  );
  const projectIndex = field(
    "project_index",
    project ? project.README.name : "",
    [required()],
    {
      validateOnChange: true,
    },
  );

  const projectRelatedAreas = field<relatedAreaType[]>(
    "project_related_areas",
    project
      ? project.related_areas.map((val) => ({
          tag: val.tag,
          priority: val.area_priority,
        }))
      : [],
    [],
    {
      validateOnChange: true,
    },
  );

  $: if ($projectRelatedAreas.value.length > 0) {
  }
  const projectTemplates = field(
    "project_templates",
    project ? Array.from(project.related_templates) : [],
    [],
    {
      validateOnChange: true,
    },
  );

  // TODO: this should be of type statusType
  const projectStatus = field(
    "project_status",
    project
      ? project.project_status
      : $plugin
        ? Status.makeDefault($plugin.settings, PROJECT)
        : Status.makeNew(),
    [],
    {
      validateOnChange: true,
    },
  );

  const projectPriority = field(
    "project_prioirty",
    project ? parseInt(project.project_priority) : 0,
    [min(1)],
    {
      validateOnChange: true,
    },
  );

  const projectDeadline = field(
    "project_deadline",
    project && project.project_deadline ? project.project_deadline : "",
    [required()],
    {
      validateOnChange: true,
    },
  );

  const createProjectForm = form(
    projectTag,
    projectFolder,
    projectIndex,
    projectRelatedAreas,
    projectTemplates,
    projectStatus,
    projectPriority,
    projectDeadline,
  );

  $: if (
    (!project && $projectTemplates.value.length > 0) ||
    (project &&
      $projectTemplates.value.length !== project.related_templates.length)
  ) {
    projectTemplates.update((val) => {
      return {
        ...val,
        dirty: true,
      };
    });
  }

  // $: if (
  //   (!project && $projectRelatedAreas.value.length > 0) ||
  //   (project &&
  //     $projectRelatedAreas.value.length !== project.related_templates.length)
  // ) {
  //   projectRelatedAreas.update((val) => {
  //     return {
  //       ...val,
  //       dirty: true,
  //     };
  //   });
  // }

  projectTag.subscribe((prjTag) => {
    if (prjTag.value.length > 0 && prjTag.dirty) {
      const projectName = prjTag.value.substring(
        prjTag.value.lastIndexOf("/") + 1,
      );
      if (projectName === "") {
        projectFolder.set("");
        projectIndex.set("");
      } else if (!tagExists($tagsStore, prjTag.value)) {
        if ($plugin) {
          if (prjTag.value.startsWith($plugin.settings.para.areas.prefix)) {
            projectFolder.set(
              prjTag.value
                .replace(/[ /]/g, "-")
                .substring($plugin.settings.para.areas.prefix.length),
            );
          } else {
            projectFolder.set(prjTag.value.replace(/[ /]/g, "-"));
          }
        }
        projectIndex.set(`${projectName}.README.md`);
      }
    }
  });

  const handleShouldOpen = (inputValue: string, selected: string) => {
    let open = true;

    const tag = inputValue.split("/");
    tag.forEach((_, index) => {
      if (tag.slice(0, index + 1).join("/") === selected) {
        open = false;
        return;
      }
    });

    return open;
  };

  $: console.log(
    $projectRelatedAreas,
    project?.related_areas.map((val) => ({
      tag: val.tag,
      priority: val.area_priority,
    })),
  );

  const isLoading = writable<boolean>(false);

  const handleCreateProject = async () => {
    isLoading.set(true);
    createProjectForm.validate();
    console.log(createProjectForm.summary());
    const formData = createProjectForm.summary();
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (!brainOS) return;

    console.log($createProjectForm.valid);
    if (!$createProjectForm.valid) return;

    let data: createPARADataType = {
      para_tag: "",
      entry_file: "",
      folder_path: "",
    };
    if (formData["project_tag"]) {
      // TODO: check that the project tag doesn't exist
      if (
        $plugin &&
        formData["project_tag"].startsWith($plugin.settings.para.areas.prefix)
      ) {
        data.para_tag = formData["project_tag"];
      } else if ($plugin) {
        data.para_tag =
          $plugin.settings.para.areas.prefix + formData["area_tag"];
      }
    }

    if (formData["project_folder"]) {
      // TODO: check that the project folder doesn't exist inside the projects folder
      data.folder_path = formData["project_folder"];
    }

    if (formData["project_index"]) {
      // TODO: check that the index file is in the correct format for a name of a file
      data.entry_file = formData["project_index"];
    }

    if (
      formData["project_related_areas"] &&
      formData["project_related_areas"].length > 0
    ) {
      // TODO: check that the main area is not tagged here
      console.log(formData["project_related_areas"]);
      data.related_areas = formData["project_related_areas"].map(
        (related_area: { tag: string; priority: number }) => related_area.tag,
      );
    }

    if (
      formData["project_templates"] &&
      formData["project_templates"].length > 0
    ) {
      data.related_templates = formData["project_templates"];
    }

    if (formData["project_deadline"]) {
      data.deadline = formData["project_deadline"];
    }

    if (formData["project_prioirty"]) {
      data.priority = formData["project_prioirty"];
    } else {
      data.priority = `${$projectStore.length + 1}`;
    }

    if ($plugin) {
      const status = $plugin.settings.para.projects.project_statuses.find(
        (status) => status.default,
      );
      if (status) {
        data.status = status.name;
      }
    }

    if (
      data.entry_file !== "" &&
      data.para_tag !== "" &&
      data.folder_path !== ""
    ) {
      console.log(data);
      // TODO: make createPARAFile return a status of the form
      // success: created, project entry details returned
      // failed: not created, status on why it wasn't created
      const file = await createPARAFile(
        data,
        brainOS.app,
        brainOS.settings,
        PROJECT,
      );
      createProjectForm.reset();
      projectStore.loadProjectEntires();
      if ($ProjectEntryStore) {
        ProjectEntryStore.set(
          projectStore.getProjectByTag($ProjectEntryStore.tag),
        );
        console.log($ProjectEntryStore);
      }

      if (file instanceof TFile) {
        brainOS.app.workspace.getLeaf().openFile(file);
      }
      console.log($projectStore);
    } else {
      // TODO: display error indicating that information added is not correct
    }
    isLoading.set(false);
  };

  let date: number[] = [];

  $: if ($projectDeadline.value.length > 0) {
    // TODO: make the date format dynamic (from the settings)
    date = $projectDeadline.value.split("-").map((val) => Number(val));
  }
</script>

<div class="flex flex-col gap-3 p-2">
  <AreasComboBox
    inputField={projectTag}
    title={"Tag"}
    placeholder={"#area/sub-area/project..."}
    error={$createProjectForm.hasError("project_tag.required")}
    shouldOpen={handleShouldOpen}
  />
  <Input
    title={"Folder"}
    placeholder={"project..."}
    inputField={projectFolder}
    error={$createProjectForm.hasError("project_folder.required")}
  />
  <Input
    title={"Entry"}
    placeholder={"project.README.md..."}
    inputField={projectIndex}
    error={$createProjectForm.hasError("project_index.required")}
  />
  <DateField
    title={"Deadline"}
    inputField={projectDeadline}
    error={$createProjectForm.hasError("project_index.required")}
    defaultValue={date.length > 0
      ? new CalendarDate(date[0], date[1], date[2])
      : undefined}
  />
  <hr />
  {#if project}
    <StatusComboBox
      inputField={projectStatus}
      title={"Status"}
      placeholder={"NEW"}
    />
  {/if}
  <TagInput
    title={"Related Areas"}
    prohibited_tag={$projectTag.value.substring(
      0,
      $projectTag.value.lastIndexOf("/"),
    )}
    placeholder="area"
    inputField={projectRelatedAreas}
  />

  <TemplateInput
    title={"Project Templates"}
    placeholder={"live-session.md"}
    inputField={projectTemplates}
  />

  <Input title={"Priority"} placeholder={"1"} inputField={projectPriority} />
  <button
    type="button"
    disabled={!$createProjectForm.valid || !$createProjectForm.dirty}
    on:click={handleCreateProject}
    class="clickable-icon inline-flex items-center gap-x-2 rounded-md bg-indigo-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    {#if !$isLoading}
      <svg
        class="-ml-0.5 h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clip-rule="evenodd"
        />
      </svg>
      Create Project
    {:else}
      <Circle3 size="40" unit="px" duration="1s" />
    {/if}
  </button>

  <button
    type="button"
    on:click={() => createProjectForm.reset()}
    class="clickable-icon inline-flex items-center gap-x-2 rounded-md bg-red px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    Reset Form
  </button>
</div>
