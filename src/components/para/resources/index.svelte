<script lang="ts">
  import Accordian from "../../UI/Accordian.svelte";
  import CreateEditResource from "./CreateEditResource.svelte";
  import ListResources from "./ListResources.svelte";
  import { ResourceEntryStore } from "../../../stores";

  let sections = [
    {
      id: "create-resource",
      title: "Create Resource",
      component: CreateEditResource,
      props: {},
    },
    // TODO: add an edit resource that uses the same component as create but fills in the info
    // it opens only if one of the two following situations occur:
    // when; a resource README is open, the para view is open, the resource tab is active
    {
      id: "list-resources",
      title: "Resources",
      component: ListResources,
      props: {},
    },
  ];

  $: if ($ResourceEntryStore) {
    sections = [
      ...sections.filter((val) => val.id !== "edit-resource"),
      {
        id: "edit-resource",
        title: `Edit ${$ResourceEntryStore.README.basename.split(".")[0]}`,
        component: CreateEditResource,
        props: { resource: $ResourceEntryStore },
      },
    ];
  } else {
    sections = sections.filter((val) => val.id !== "edit-area");
  }

  let stats = {
    archived: {
      cancelled: 0,
      done: 0,
      postponed: 0,
    },
    active: {
      new: 0,
      in_progress: 0,
    },
  };
</script>

<section class="space-y-2">
  <!-- Resource Header -->

  <div class="flex flex-row min-w-full rounded-lg p-2">
    <!-- Resource Header Title + badges with statuses  -->
    <div class="w-2/3 grid grid-rows-2 gap-2">
      <span class="text-start p-2 text-2xl">Resources</span>

      <div class="flex flex-row gap-2 items-center justify-start">
        <span
          class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
          >New {stats.active.new}</span
        >

        <span
          class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
          >In Progress {stats.active.in_progress}</span
        >
      </div>
    </div>
    <!-- Resource statuses  -->
    <div class="flex flex-row gap-1 w-1/3 items-center justify-center">
      <div class="flex flex-col gap-2">
        <span class="text-center p-2 text-md">Archived</span>

        <span
          class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
          >Done {stats.archived.postponed}</span
        >
        <span
          class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
          >Postponed {stats.archived.postponed}</span
        >
        <span
          class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
          >Cancelled {stats.archived.cancelled}</span
        >
      </div>
    </div>
  </div>

  <!-- Interchangable Area -->
  <div>
    <Accordian items={sections} />
  </div>
</section>
