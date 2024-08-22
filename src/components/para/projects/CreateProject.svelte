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
  import {
    Status,
    tagExists,
    getRelativePath,
    filterTags,
    filterTemplates,
    addTagToInput,
    addTemplateToInput,
    removeTagFromInput,
    removeTemplateFromInput,
    createPARAFile,
    type createPARADataType,
  } from "../../../utils";
  import { StatusComboBox, AreasComboBox, Input, TagInput } from "../../UI";
  import { PROJECT } from "../../../constants";
  import DateField from "../../UI/DateField.svelte";
  import type { ProjectEntryType } from "../../../types/paraTypes";
  import { CalendarDate } from "@internationalized/date";
  import { TFile } from "obsidian";
  import { onDestroy } from "svelte";

  export let project: ProjectEntryType | undefined;

  // TODO: move this to utils so that every tag usage uses this to check existence
  function checkTagExistance() {
    return (tag: string) => {
      const tags = get(tagsStore);
      if (project) {
        return {
          valid: !tagExists(tags, tag) || project.tag === tag,
          name: "tag_already_taken",
        };
      }
      return {
        valid: !tagExists(tags, tag),
        name: "tag_already_taken",
      };
    };
  }
  // TODO: make sure that the user picks an area first, right now if they don't pick anything they can still put dumb shit
  const projectTag = field(
    "project_tag",
    project ? project.tag : "",
    [required(), checkTagExistance()],
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

  type TagComboInputType = {
    id: string; // will be used as the thing to retrieve the information the consumer of this componenet wants
    name: string;
    sub_title: string;
  };
  const projectRelatedAreas = field<TagComboInputType[]>(
    "project_related_areas",
    project
      ? project.related_areas.map((val) => {
          const brainOS = get(plugin);
          let name = val.tag;
          if (brainOS) {
            name = val.tag.substring(brainOS.settings.para.areas.prefix.length);
          }
          return {
            id: val.tag,
            name: name,
            sub_title: val.area_priority,
          };
        })
      : [],
    [],
    {
      validateOnChange: true,
    },
  );

  const projectRelatedTemplates = field<TagComboInputType[]>(
    "project_related_templates",
    project
      ? project.related_templates.map((val) => {
          const brainOS = get(plugin);

          let name = val.name;
          let sub_title = "";
          if (brainOS) {
            name = getRelativePath(brainOS.settings.otherTemplates, val.path);
          }
          if (val.parent) {
            sub_title = val.parent.name;
          }
          return {
            id: val.path,
            name: name,
            sub_title: sub_title,
          };
        })
      : [],
    [],
    {
      validateOnChange: true,
    },
  );
  const projectTemplates = field(
    "project_templates",
    project ? Array.from(project.related_templates) : [],
    [],
    {
      validateOnChange: true,
    },
  );

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

  function checkIfInteger() {
    return (num: string) => {
      return { valid: !isNaN(parseInt(num)), name: "not_an_integer" };
    };
  }
  const projectPriority = field(
    "project_priority",
    project ? parseInt(project.project_priority) : $projectStore.length + 1,
    [min(1), checkIfInteger()],
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
    projectRelatedTemplates,
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

  const unsub = projectTag.subscribe((prjTag) => {
    if (prjTag.value.length > 0 && prjTag.dirty) {
      const projectName = prjTag.value.substring(
        prjTag.value.lastIndexOf("/") + 1,
      );
      if (projectName === "") {
        projectFolder.set("");
        projectIndex.set("");
      } else {
        const brainOS = get(plugin);
        if (brainOS) {
          if (prjTag.value.startsWith(brainOS.settings.para.areas.prefix)) {
            projectFolder.set(
              prjTag.value
                .replace(/[ /]/g, "-")
                .substring(brainOS.settings.para.areas.prefix.length),
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

  const isLoading = writable<boolean>(false);

  const handleCreateProject = async () => {
    isLoading.set(true);
    await createProjectForm.validate();
    const formData = createProjectForm.summary();
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (!brainOS) {
      // err Notice
      isLoading.set(false);
      return;
    }

    if (!$createProjectForm.valid) {
      isLoading.set(false);
      return;
    }

    let data: createPARADataType = {
      para_tag: "",
      entry_file: "",
      folder_path: "",
    };
    if (formData["project_tag"]) {
      if (
        $plugin &&
        formData["project_tag"].startsWith($plugin.settings.para.areas.prefix)
      ) {
        data.para_tag = formData["project_tag"];
      } else if ($plugin) {
        data.para_tag =
          $plugin.settings.para.areas.prefix + formData["project_tag"];
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
      data.related_areas = formData["project_related_areas"]
        .map(
          (related_area: { id: string; name: string; sub_title: string }) =>
            related_area.id,
        )
        .filter(
          (val: { id: string; name: string; sub_title: string }) =>
            val.id !==
            formData["project_tag"].substring(
              0,
              formData["project_tag"].lastIndexOf("/"),
            ),
        );
    }

    if (
      formData["project_related_templates"] &&
      formData["project_related_templates"].length > 0
    ) {
      data.related_templates = formData["project_related_templates"];
    }

    if (formData["project_deadline"]) {
      data.deadline = formData["project_deadline"];
    }

    console.log(parseInt(formData["project_priority"]));
    if (formData["project_priority"]) {
      const priority = parseInt(formData["project_priority"]);

      data.priority = priority;
    } else {
      data.priority = $projectStore.length + 1;
    }

    const status = brainOS.settings.para.projects.project_statuses.find(
      (status) => {
        if (project === undefined) {
          return status.default;
        }
        return status.id === formData["project_status"].id;
      },
    );
    if (status) {
      data.status = status.id;
    }

    if (
      data.entry_file !== "" &&
      data.para_tag !== "" &&
      data.folder_path !== ""
    ) {
      console.log(data);
      // TODO: make createPARAFile return a status of the form
      // success: created, project TFile
      // failed: not created, status on why it wasn't created
      const file = await createPARAFile(
        data,
        brainOS.app,
        brainOS.settings,
        PROJECT,
      );
      createProjectForm.reset();

      if (file instanceof TFile) {
        ProjectEntryStore.set(undefined);
        brainOS.app.workspace.getLeaf().openFile(file);
      }
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

  onDestroy(unsub);
</script>

<div class="flex flex-col gap-3 p-2">
  <AreasComboBox
    inputField={projectTag}
    title={"Tag"}
    placeholder={"#area/sub-area/project..."}
    shouldOpen={handleShouldOpen}
    is_disabled={project ? true : undefined}
  />
  <Input
    title={"Folder"}
    placeholder={"project..."}
    inputField={projectFolder}
    disabled={project !== undefined}
  />
  <Input
    title={"Entry"}
    placeholder={"project.README.md..."}
    inputField={projectIndex}
    disabled={project !== undefined}
  />
  <DateField
    title={"Deadline"}
    inputField={projectDeadline}
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
    {addTagToInput}
    {filterTags}
    {removeTagFromInput}
  />

  <TagInput
    title={"Project Templates"}
    placeholder="live-session.md"
    inputField={projectRelatedTemplates}
    addTagToInput={addTemplateToInput}
    filterTags={filterTemplates}
    removeTagFromInput={removeTemplateFromInput}
  />

  <Input title={"Priority"} placeholder={"1"} inputField={projectPriority} />
  <button
    type="button"
    disabled={!$createProjectForm.valid}
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
