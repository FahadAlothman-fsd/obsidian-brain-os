<script lang="ts">
  import { Circle3 } from "svelte-loading-spinners";
  import { get, writable } from "svelte/store";
  import { form, field } from "svelte-forms";
  import { required } from "svelte-forms/validators";
  import {
    plugin,
    ResourceEntryStore,
    resourceStore,
    tagsStore,
  } from "../../../stores";
  import { tagExists } from "../../../utils";
  import Input from "../../UI/Input.svelte";
  import TemplateInput from "../../UI/TemplateInput.svelte";
  import { createPARAFile, type createPARADataType } from "../../../utils/para";
  import { RESOURCE } from "../../../constants";
  import type { ResourceEntryType } from "../../../types/paraTypes";
  import { TFile } from "obsidian";

  export let resource: ResourceEntryType | undefined;

  const resourceTag = field(
    "resource_tag",
    resource
      ? resource.tag.substring(
          $plugin ? $plugin.settings.para.resources.prefix.length : 0,
        )
      : "",
    [required()],
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
  const resourceTemplates = field<TFile[]>(
    "resource_templates",
    resource ? Array.from(resource.related_templates) : [],
    [],
    {
      validateOnChange: true,
    },
  );

  // TODO: add a templates tagsinput like but the suggestions being templates for this resource
  const createResourceForm = form(
    resourceTag,
    resourceFolder,
    resourceIndex,
    resourceTemplates,
  );

  $: if (
    (!resource && $resourceTemplates.value.length > 0) ||
    (resource &&
      $resourceTemplates.value.length !== resource.related_templates.length)
  ) {
    resourceTemplates.update((val) => {
      return {
        ...val,
        dirty: true,
      };
    });
  }

  resourceTag.subscribe((resTag) => {
    if (resTag.value.length > 0 && resTag.dirty) {
      const resourceName = resTag.value.substring(
        resTag.value.lastIndexOf("/") + 1,
      );
      if (resourceName === "") {
        resourceFolder.set("");
        resourceIndex.set("");
      } else if (!tagExists($tagsStore, resTag.value)) {
        resourceFolder.set(resourceName);
        resourceIndex.set(`${resourceName}.README.md`);
        if ($plugin) {
          if (resTag.value.startsWith($plugin.settings.para.resources.prefix)) {
            resourceFolder.set(
              resTag.value
                .replace(/[ /]/g, "-")
                .substring($plugin.settings.para.areas.prefix.length),
            );
            resourceIndex.set(`${resourceName}.README.md`);
          } else {
            resourceFolder.set(resTag.value.replace(/[ /]/g, "-"));
            resourceIndex.set(`${resourceName}.README.md`);
          }
        }
      }
    }
  });

  const isLoading = writable<boolean>(false);

  const handleCreateResource = async () => {
    isLoading.set(true);
    createResourceForm.validate();
    console.log(createResourceForm.summary());
    const formData = createResourceForm.summary();
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (!brainOS) return;

    let data: createPARADataType = {
      para_tag: "",
      entry_file: "",
      folder_path: "",
    };
    if (formData["resource_tag"]) {
      // TODO: check that the resource tag doesn't exist
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
      // TODO: check that the resource folder doesn't exist inside the projects folder
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
      // TODO: check that the main area is not tagged here
      data.related_templates = formData["resource_templates"];
    }

    if (
      data.entry_file !== "" &&
      data.para_tag !== "" &&
      data.folder_path !== ""
    ) {
      console.log(data);
      const file = await createPARAFile(
        data,
        brainOS.app,
        brainOS.settings,
        RESOURCE,
      );
      createResourceForm.reset();

      resourceStore.loadResourceEntires();
      if ($ResourceEntryStore) {
        ResourceEntryStore.set(
          resourceStore.getResourceByTag($ResourceEntryStore.tag),
        );
        console.log($ResourceEntryStore);
      }

      if (file instanceof TFile) {
        brainOS.app.workspace.getLeaf().openFile(file);
      }
    } else {
      // TODO: display error indicating that information added is not correct
    }
    isLoading.set(false);
  };
</script>

<div class="flex flex-col gap-3 p-2">
  <Input
    inputField={resourceTag}
    title={"Tag"}
    placeholder={"#article..."}
    error={$createResourceForm.hasError("resource_tag.required")}
  />
  <Input
    title={"Folder"}
    placeholder={"articles..."}
    inputField={resourceFolder}
    error={$createResourceForm.hasError("resource_folder.required")}
  />
  <Input
    title={"Entry"}
    placeholder={"resource.README.md..."}
    inputField={resourceIndex}
    error={$createResourceForm.hasError("resource_index.required")}
  />
  <hr />
  <TemplateInput
    title={"Resource Templates"}
    placeholder={"fiction-books.md"}
    inputField={resourceTemplates}
  />
  <button
    type="button"
    disabled={!$createResourceForm.valid || !$createResourceForm.dirty}
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
      Create Resource
    {:else}
      <Circle3 size="40" unit="px" duration="1s" />
    {/if}
  </button>
</div>
