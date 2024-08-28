<script lang="ts">
  import { Circle3 } from "svelte-loading-spinners";
  import { get, writable } from "svelte/store";
  import { form, field } from "svelte-forms";
  import { required } from "svelte-forms/validators";
  import { plugin, ResourceEntryStore, tagsStore } from "../../../stores";
  import {
    tagExists,
    getRelativePath,
    filterTemplates,
    addTemplateToInput,
    removeTemplateFromInput,
    createPARAFile,
    type createPARADataType,
  } from "../../../utils";
  import { Input, TagInput } from "../../UI";
  import { RESOURCE } from "../../../constants";
  import type { ResourceEntryType } from "../../../types/paraTypes";
  import { TFile } from "obsidian";
  import { onDestroy } from "svelte";

  export let resource: ResourceEntryType | undefined;

  function checkTagExistance() {
    return (tag: string) => {
      let value = tag;
      const tags = get(tagsStore);
      if (resource) {
        return {
          valid: !tagExists(tags, value) || resource.tag === tag,
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
  const resourceTag = field(
    "resource_tag",
    resource ? resource.tag : "",
    [required(), checkTagExistance()],
    {
      validateOnChange: true,
    },
  );

  const resourceFolder = field(
    "resource_folder",
    resource ? resource.folder_name?.name : "",
    [required()],
    {
      validateOnChange: true,
    },
  );

  const resourceIndex = field(
    "resource_index",
    resource ? resource.README.name : "",
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

  const resourceTemplates = field<TagComboInputType[]>(
    "resource_templates",
    resource
      ? resource.related_templates.map((val) => {
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

  const createResourceForm = form(
    resourceTag,
    resourceFolder,
    resourceIndex,
    resourceTemplates,
  );

  const unsub = resourceTag.subscribe((resTag) => {
    if (resTag.value.length > 0 && resTag.dirty) {
      const resourceName = resTag.value.substring(
        resTag.value.lastIndexOf("/") + 1,
      );
      if (resourceName === "") {
        resourceFolder.set("");
        resourceIndex.set("");
      } else {
        resourceIndex.set(`${resourceName}.README.md`);
        resourceFolder.set(`${resourceName}`);
      }
    } else if (resTag.dirty && resTag.value === "") {
      resourceFolder.set("");
      resourceIndex.set("");
    }
  });

  const isLoading = writable<boolean>(false);

  const handleCreateResource = async () => {
    isLoading.set(true);
    await createResourceForm.validate();
    const formData = createResourceForm.summary();
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (!brainOS) {
      // err Notice
      isLoading.set(false);
      return;
    }

    if (!$createResourceForm.valid) {
      isLoading.set(false);
      return;
    }

    let data: createPARADataType = {
      para_tag: "",
      entry_file: "",
      folder_path: "",
    };
    if (formData["resource_tag"]) {
      if (
        $plugin &&
        formData["resource_tag"].startsWith(
          $plugin.settings.para.resources.prefix,
        )
      ) {
        data.para_tag = formData["resource_tag"];
      } else if ($plugin) {
        data.para_tag =
          $plugin.settings.para.resources.prefix + formData["resource_tag"];
      }
    }

    if (formData["resource_folder"]) {
      // TODO: check that the project folder doesn't exist inside the projects folder
      data.folder_path = formData["resource_folder"];
    }

    if (formData["resource_index"]) {
      // TODO: check that the index file is in the correct format for a name of a file
      data.entry_file = formData["resource_index"];
    }

    if (
      formData["resource_templates"] &&
      formData["resource_templates"].length > 0
    ) {
      data.related_templates = formData["resource_templates"];
    }

    if (
      data.entry_file !== "" &&
      data.para_tag !== "" &&
      data.folder_path !== ""
    ) {
      // TODO: make createPARAFile return a status of the form
      // success: created, project TFile
      // failed: not created, status on why it wasn't created
      const file = await createPARAFile(
        data,
        brainOS.app,
        brainOS.settings,
        RESOURCE,
      );
      createResourceForm.reset();

      if (file instanceof TFile) {
        ResourceEntryStore.set(undefined);
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
  <Input
    inputField={resourceTag}
    title={"Tag"}
    placeholder={"books"}
    disabled={resource !== undefined}
  />
  <Input
    title={"Folder"}
    placeholder={"resource..."}
    inputField={resourceFolder}
    disabled={resource !== undefined}
  />
  <Input
    title={"Entry"}
    placeholder={"resource.README.md..."}
    inputField={resourceIndex}
    disabled={resource !== undefined}
  />
  <hr />

  <TagInput
    title={"Resource Templates"}
    placeholder="live-session.md"
    inputField={resourceTemplates}
    addTagToInput={addTemplateToInput}
    filterTags={filterTemplates}
    removeTagFromInput={removeTemplateFromInput}
  />

  <button
    type="button"
    disabled={!$createResourceForm.valid}
    on:click={handleCreateResource}
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
      {#if resource === undefined}
        Create Resource
      {:else}
        Save Changes
      {/if}
    {:else}
      <Circle3 size="40" unit="px" duration="1s" />
    {/if}
  </button>

  {#if resource === undefined}
    <button
      type="button"
      on:click={() => createResourceForm.reset()}
      class="clickable-icon inline-flex items-center gap-x-2 rounded-md bg-red px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      Reset Form
    </button>
  {/if}
</div>
