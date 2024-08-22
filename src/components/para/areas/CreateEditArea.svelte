<script lang="ts">
  import { Circle3 } from "svelte-loading-spinners";
  import { get, writable } from "svelte/store";
  import { form, field } from "svelte-forms";
  import { min, required } from "svelte-forms/validators";
  import {
    plugin,
    AreaEntryStore,
    areaStore,
    tagsStore,
  } from "../../../stores";
  import {
    tagExists,
    getRelativePath,
    filterTemplates,
    addTemplateToInput,
    removeTemplateFromInput,
    createPARAFile,
    type createPARADataType,
  } from "../../../utils";
  import { AreasComboBox, Input, TagInput, Switch } from "../../UI";
  import { AREA, SUB_AREA } from "../../../constants";
  import type { AreaEntryType } from "../../../types/paraTypes";
  import { TFile } from "obsidian";
  import { onDestroy } from "svelte";

  export let area: AreaEntryType | undefined;

  const areaSwitch = field(
    "area_switch",
    area && area.tag.split("/").length > 1 ? true : false,
  );

  function checkTagExistance() {
    return (tag: string) => {
      let value = tag;
      const brainOS = get(plugin);
      const is_sub_area = get(areaSwitch).value;
      if (brainOS && !is_sub_area) {
        value = brainOS.settings.para.areas.prefix + value;
      }
      const tags = get(tagsStore);
      if (area) {
        return {
          valid: !tagExists(tags, value) || area.tag === tag,
          name: "tag_already_taken",
        };
      }

      return {
        valid: !tagExists(tags, value),
        name: "tag_already_taken",
      };
    };
  }

  // TODO: make sure that the user picks an area first, right now if they don't pick anything they can still put dumb shit
  const areaTag = field(
    "area_tag",
    area ? area.tag : "",
    [required(), checkTagExistance()],
    {
      validateOnChange: true,
    },
  );

  const areaFolder = field(
    "area_folder",
    area ? area.folder_name?.name : "",
    [required()],
    {
      validateOnChange: true,
    },
  );
  const areaIndex = field(
    "area_index",
    area ? area.README.name : "",
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

  const areaTemplates = field<TagComboInputType[]>(
    "area_templates",
    area
      ? area.related_templates.map((val) => {
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

  function checkIfInteger() {
    return (num: string) => {
      return { valid: !isNaN(parseInt(num)), name: "not_an_integer" };
    };
  }
  const areaPriority = field(
    "area_priority",
    area ? parseInt(area.area_priority) : $areaStore.length + 1,
    [min(1), checkIfInteger()],
    {
      validateOnChange: true,
    },
  );

  const createAreaForm = form(
    areaSwitch,
    areaTag,
    areaFolder,
    areaIndex,
    areaTemplates,
    areaPriority,
  );

  const unsub = areaTag.subscribe((prjTag) => {
    if (prjTag.value.length > 0 && prjTag.dirty) {
      const areaName = prjTag.value.substring(
        prjTag.value.lastIndexOf("/") + 1,
      );
      if (areaName === "") {
        areaFolder.set("");
        areaIndex.set("");
      } else {
        areaIndex.set(`${areaName}.README.md`);
        areaFolder.set(`${areaName}`);
      }
    } else if (prjTag.dirty && prjTag.value === "") {
      areaFolder.set("");
      areaIndex.set("");
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

  const handleCreateArea = async () => {
    isLoading.set(true);
    await createAreaForm.validate();
    const formData = createAreaForm.summary();
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (!brainOS) {
      // err Notice
      isLoading.set(false);
      return;
    }

    if (!$createAreaForm.valid) {
      isLoading.set(false);
      return;
    }

    let data: createPARADataType = {
      para_tag: "",
      entry_file: "",
      folder_path: "",
    };
    if (formData["area_tag"]) {
      if (
        $plugin &&
        formData["area_tag"].startsWith($plugin.settings.para.areas.prefix)
      ) {
        data.para_tag = formData["area_tag"];
      } else if ($plugin) {
        data.para_tag =
          $plugin.settings.para.areas.prefix + formData["area_tag"];
      }
    }

    if (formData["area_folder"]) {
      // TODO: check that the project folder doesn't exist inside the projects folder
      data.folder_path = formData["area_folder"];
    }

    if (formData["area_index"]) {
      // TODO: check that the index file is in the correct format for a name of a file
      data.entry_file = formData["area_index"];
    }

    if (formData["area_templates"] && formData["area_templates"].length > 0) {
      data.related_templates = formData["area_templates"];
    }

    if (formData["area_priority"]) {
      const priority = parseInt(formData["area_priority"]);

      data.priority = priority;
    } else {
      data.priority = $areaStore.length + 1;
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
        formData["area_switch"] ? SUB_AREA : AREA,
      );
      createAreaForm.reset();

      if (file instanceof TFile) {
        AreaEntryStore.set(undefined);
        brainOS.app.workspace.getLeaf().openFile(file);
      }
    } else {
      // TODO: display error indicating that information added is not correct
    }
    isLoading.set(false);
  };

  onDestroy(unsub);
</script>

<div class="flex flex-col gap-3 p-2">
  <Switch disabled={area !== undefined} inputField={areaSwitch} />
  {#if !$areaSwitch.value}
    <Input
      inputField={areaTag}
      title={"Tag"}
      placeholder={"#area"}
      disabled={area !== undefined}
    />
  {:else}
    <AreasComboBox
      inputField={areaTag}
      title={"Tag"}
      placeholder={"#area/sub-area"}
      shouldOpen={handleShouldOpen}
      is_disabled={area ? true : undefined}
    />
  {/if}
  <Input
    title={"Folder"}
    placeholder={"project..."}
    inputField={areaFolder}
    disabled={area !== undefined}
  />
  <Input
    title={"Entry"}
    placeholder={"area.README.md..."}
    inputField={areaIndex}
    disabled={area !== undefined}
  />
  <hr />

  <TagInput
    title={"Area Templates"}
    placeholder="live-session.md"
    inputField={areaTemplates}
    addTagToInput={addTemplateToInput}
    filterTags={filterTemplates}
    removeTagFromInput={removeTemplateFromInput}
  />

  <Input title={"Priority"} placeholder={"1"} inputField={areaPriority} />
  <button
    type="button"
    disabled={!$createAreaForm.valid}
    on:click={handleCreateArea}
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
      Create Area
    {:else}
      <Circle3 size="40" unit="px" duration="1s" />
    {/if}
  </button>

  <button
    type="button"
    on:click={() => createAreaForm.reset()}
    class="clickable-icon inline-flex items-center gap-x-2 rounded-md bg-red px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    Reset Form
  </button>
</div>
