<script lang="ts">
  import { Circle3 } from "svelte-loading-spinners";
  import { get, writable } from "svelte/store";
  import { form, field } from "svelte-forms";
  import { required } from "svelte-forms/validators";
  import { app, plugin, tagsStore } from "../../../stores";
  import { tagExists } from "../../../utils";
  import ComboBox from "../../UI/ComboBox.svelte";
  import Input from "../../UI/Input.svelte";
  import TagInput from "../../UI/TagInput.svelte";
  import type { Tag } from "../../../types";
  import { createPARAFile, type createPARADataType } from "../../../utils/para";
  import { PROJECT } from "../../../constants";

  const projectTag = field("project_tag", "", [required()], {
    validateOnChange: true,
  });
  const projectFolder = field("project_folder", "", [required()], {
    validateOnChange: true,
  });
  const projectIndex = field("project_index", "", [required()], {
    validateOnChange: true,
  });
  const projectRelatedAreas = field<Tag[]>("project_related_areas", [], [], {
    validateOnChange: true,
  });
  const projectTemplates = field("project_templates", [], [], {
    validateOnChange: true,
  });

  // TODO: add a templates tagsinput like but the suggestions being templates for this project
  const createProjectForm = form(
    projectTag,
    projectFolder,
    projectIndex,
    projectRelatedAreas,
  );

  projectTag.subscribe((prjTag) => {
    if (prjTag.value.length > 0) {
      const projectName = prjTag.value.substring(
        prjTag.value.lastIndexOf("/") + 1,
      );
      if (projectName === "") {
        projectFolder.set("");
        projectIndex.set("");
      } else if (!tagExists($tagsStore, prjTag.value)) {
        projectFolder.set(projectName);
        projectIndex.set(`${projectName}.README.md`);
      }
    }
  });

  const handleShouldOpen = (inputValue: string, selected: string) => {
    // const prjTag = get(projectTag);
    let open = true;

    const tag = inputValue.split("/");
    // console.log(tag);
    tag.forEach((_, index) => {
      // console.log(
      //   index,
      //   value,
      //   selected,
      //   tag.slice(0, index + 1).join("/"),
      //   tag.slice(0, index + 1).join("/") === selected,
      // );
      if (tag.slice(0, index + 1).join("/") === selected) {
        open = false;
        return;
      }
    });
    // if (inputValue.length < selected.length) {
    //   open;
    // }

    return open;
  };

  const isLoading = writable<boolean>(false);

  const handleCreateProject = async () => {
    isLoading.set(true);
    createProjectForm.validate();
    console.log(createProjectForm.summary());
    const formData = createProjectForm.summary();
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (!brainOS) return;

    let data: createPARADataType = {
      para_tag: "",
      entry_file: "",
      folder_path: "",
    };
    if (formData["project_tag"]) {
      // TODO: check that the project tag doesn't exist
      data.para_tag = formData["project_tag"];
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
    }

    if (
      data.entry_file !== "" &&
      data.para_tag !== "" &&
      data.folder_path !== ""
    ) {
      console.log(data);
      await createPARAFile(data, brainOS.app, brainOS.settings, PROJECT);
    } else {
      // TODO: display error indicating that information added is not correct
    }
    isLoading.set(false);
  };
</script>

<div class="flex flex-col gap-3 p-2">
  <ComboBox
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
  <hr />
  <TagInput
    title={"Related Areas"}
    placeholder={`#${$plugin?.settings.para.areas.prefix}area`}
    inputField={projectRelatedAreas}
    error={$createProjectForm.hasError("project_related_areas.required")}
  />

  <TagInput
    title={"Project Templates"}
    placeholder={"live-session.md"}
    inputField={projectTemplates}
    error={$createProjectForm.hasError("project_templates.required")}
  />
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
</div>
