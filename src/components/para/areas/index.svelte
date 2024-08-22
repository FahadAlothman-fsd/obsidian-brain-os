<script lang="ts">
  import Accordian from "../../UI/Accordian.svelte";
  import CreateArea from "./CreateEditArea.svelte";
  import ListAreas from "./ListAreas.svelte";
  import { AreaEntryStore, areaStore } from "../../../stores";

  let sections = [
    {
      id: "create-area",
      title: "Create Area",
      component: CreateArea,
      props: {},
    },
    // TODO: add an edit area that uses the same component as create but fills in the info
    // it should be only when a area README is open
    {
      id: "list-area",
      title: "Areas",
      component: ListAreas,
      props: {},
    },
  ];

  $: if ($AreaEntryStore) {
    sections = [
      ...sections.filter((val) => val.id !== "edit-area"),
      {
        id: "edit-area",
        title: `Edit ${$AreaEntryStore.README.basename.split(".")[0]}`,
        component: CreateArea,
        props: { area: $AreaEntryStore },
      },
    ];
    console.log("area to edit");
  } else {
    sections = sections.filter((val) => val.id !== "edit-area");
    console.log("in clearing edit area");
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
  <!-- Projects Header -->

  <div class="flex flex-row min-w-full rounded-lg p-2">
    <!-- Project  Header + badges with statuses  -->
    <div class="w-2/3 grid grid-cols-2 gap-2">
      <span class="col-span-2 text-center p-2 text-2xl">Areas</span>

      <div class="col-span-2 flex flex-row gap-2 items-center justify-center">
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
    <!-- Project Priority List tags -->
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
    <!-- Opened project if a project README file is opened and this view is open or picked from project priority lish  -->

    <Accordian items={sections} />
    <!-- <PieChart /> -->
  </div>
</section>
