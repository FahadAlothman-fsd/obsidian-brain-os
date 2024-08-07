<script lang="ts">
  import { get } from "svelte/store";
  import { form, field } from "svelte-forms";
  import { required } from "svelte-forms/validators";
  import { app, plugin, tagsStore } from "../../../stores";
  import { tagExists } from "../../../utils";
  import { Switch, Input, ComboBox, TagInput } from "../../UI";
  import TemplateInput from "../../UI/TemplateInput.svelte";
  import {
    createPARAFile,
    findParaFile,
    type createPARADataType,
  } from "../../../utils/para";
  import { onDestroy } from "svelte";
  import { SUB_AREA, AREA } from "../../../constants";

  const areaSwitch = field("area_switch", false);
  const areaTag = field("area_tag", "", [required()], {
    validateOnChange: true,
  });
  const areaFolder = field("area_folder", "", [required()], {
    validateOnChange: true,
  });
  const areaIndex = field("area_index", "", [required()], {
    validateOnChange: true,
  });
  // TODO: rethink if there should be related areas to an area/sub-area or not
  //
  // const projectRelatedAreas = field<Tag[]>(
  //   "project_related_areas",
  //   [],
  //   [required()],
  //   {
  //     validateOnChange: true,
  //   },
  // );
  //
  // TODO: add a templates tagsinput like but the suggestions being templates for this area

  const areaTemplates = field("area_templates", [], [], {
    validateOnChange: true,
  });
  const createAreaForm = form(
    areaSwitch,
    areaTag,
    areaFolder,
    areaIndex,
    areaTemplates,
  );

  const unsubAreaSwitch = areaTag.subscribe((areaTag) => {
    const area_switch = get(areaSwitch);
    if (areaTag.value.length > 0) {
      const areaName = area_switch.value
        ? areaTag.value.substring(areaTag.value.lastIndexOf("/") + 1)
        : areaTag.value[0] === "#"
          ? areaTag.value.slice(1)
          : areaTag.value;

      if (areaName === "") {
        areaFolder.set("");
        areaIndex.set("");
      } else if (!tagExists($tagsStore, areaTag.value)) {
        console.log(areaTag.value, areaName);
        areaFolder.set(areaName);
        areaIndex.set(`${areaName}.README.md`);
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

    return open;
  };

  const handleCreateArea = async () => {
    createAreaForm.validate();
    // TODO: have a type in the para types file
    let type: typeof AREA | typeof SUB_AREA = get(areaSwitch).value
      ? SUB_AREA
      : AREA;
    console.log(createAreaForm.summary());
    const formData = createAreaForm.summary();
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (!brainOS) return;

    let data: createPARADataType = {
      para_tag: "",
      entry_file: "",
      folder_path: "",
      related_templates: [],
    };
    if (formData["area_tag"]) {
      data.para_tag = formData["area_tag"];
    }

    if (formData["area_folder"]) {
      if (type === SUB_AREA) {
        const parentTag = data.para_tag.substring(
          0,
          data.para_tag.lastIndexOf("/"),
        );
        const parentFolder = await findParaFile(
          { tags: [parentTag] },
          brainOS.app,
          brainOS.settings,
          type,
        );
        if (!parentFolder) return;
        console.log(parentFolder);
        // TODO: make sure that it works on both unix and windows
        data.folder_path = `${parentFolder}/${formData["area_folder"]}`;
      } else {
        data.folder_path = formData["area_folder"];
      }
    }

    if (formData["area_index"]) {
      data.entry_file = formData["area_index"];
    }

    if (formData["area_templates"] && formData["area_templates"].length > 0) {
      data.related_templates = formData["area_templates"];
    }

    if (
      data.entry_file !== "" &&
      data.para_tag !== "" &&
      data.folder_path !== ""
    ) {
      // TODO: add a way to handle area and sub-area creation
      // for sub-area: first look for the parent tag and find the folder name of the parent area
      console.log(data);
      await createPARAFile(data, brainOS.app, brainOS.settings, type);
      createAreaForm.reset();
    } else {
      // TODO: display error indicating that information added is not correct
    }
  };

  onDestroy(() => unsubAreaSwitch());
</script>

<div class="flex flex-col gap-3 p-2">
  <Switch inputField={areaSwitch} />
  {#if !$areaSwitch.value}
    <Input
      inputField={areaTag}
      title={"Tag"}
      placeholder={"#area/sub-area/project..."}
      error={$createAreaForm.hasError("project_tag.required")}
    />
  {:else}
    <ComboBox
      inputField={areaTag}
      title={"Tag"}
      placeholder={"#area/sub-area/project..."}
      error={$createAreaForm.hasError("project_tag.required")}
      shouldOpen={handleShouldOpen}
    />
  {/if}
  <Input
    title={"Folder"}
    placeholder={"project..."}
    inputField={areaFolder}
    error={$createAreaForm.hasError("project_folder.required")}
  />
  <Input
    title={"Entry"}
    placeholder={"project.README.md..."}
    inputField={areaIndex}
    error={$createAreaForm.hasError("project_index.required")}
  />
  <hr />

  <TemplateInput
    title={"Project Templates"}
    placeholder={"live-session.md"}
    inputField={areaTemplates}
    error={$createAreaForm.hasError("area_templates.required")}
  />
  <button
    type="button"
    disabled={!$createAreaForm.valid || !$createAreaForm.dirty}
    on:click={handleCreateArea}
    class="clickable-icon inline-flex items-center gap-x-2 rounded-md bg-indigo-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
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
    Create Area
  </button>
</div>
