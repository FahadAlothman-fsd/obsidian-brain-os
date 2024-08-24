<script lang="ts">
  import Accordian from "../../UI/Accordian.svelte";
  import CreateEditProject from "./CreateEditProject.svelte";
  import ListProjects from "./ListProjects.svelte";
  import { ProjectEntryStore, projectStore } from "../../../stores";
  import { StatusType } from "../../../utils";
  // import PieChart from "../../charts/PieChart.svelte";

  let sections = [
    {
      id: "create-project",
      title: "Create Project",
      component: CreateEditProject,
      props: {},
    },
    // TODO: add an edit area that uses the same component as create but fills in the info
    // it should be only when a area README is open
    {
      id: "list-projects",
      title: "Projects",
      component: ListProjects,
      props: {},
    },
  ];

  $: if ($ProjectEntryStore) {
    sections = [
      ...sections.filter((val) => val.id !== "edit-project"),
      {
        id: "edit-project",
        title: `Edit ${$ProjectEntryStore.README.basename.split(".")[0]}`,
        component: CreateEditProject,
        props: { project: $ProjectEntryStore },
      },
    ];
  } else {
    sections = sections.filter((val) => val.id !== "edit-project");
  }

  // TODO: change this to an object with keys that corresponds to the status project types
  let stats = {
    archived: {
      cancelled: 0,
      done: 0,
      postponed: 0,
    },
    active: {
      new: 0,
      in_progress: 0,
      post_processing: 0,
    },
  };

  $: if ($projectStore) {
    stats = {
      archived: {
        cancelled: 0,
        done: 0,
        postponed: 0,
      },
      active: {
        new: 0,
        in_progress: 0,
        post_processing: 0,
      },
    };

    $projectStore.forEach((project) => {
      switch (project.project_status.type) {
        // Active
        case StatusType.NEW:
          stats.active.new += 1;
          break;
        case StatusType.IN_PROGRESS:
          stats.active.in_progress += 1;
          break;
        case StatusType.POST_PROCESSING:
          stats.active.post_processing += 1;
          break;

        // Archive
        case StatusType.DONE:
          stats.archived.done += 1;
          break;
        case StatusType.CANCELLED:
          stats.archived.cancelled += 1;
          break;
        case StatusType.ON_HOLD:
          stats.archived.postponed += 1;
          break;
      }
    });
  }
</script>

<section class="space-y-2">
  <!-- Projects Header -->

  <div class="flex flex-row min-w-full rounded-lg p-2">
    <!-- Project  Header + badges with statuses  -->
    <div class="w-2/3 grid grid-cols-2 gap-2">
      <span class="col-span-2 text-center p-2 text-2xl">Projects</span>

      <div class="col-span-2 flex flex-row gap-2 items-center justify-center">
        <span
          class="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/20"
          >New {stats.active.new}</span
        >

        <span
          class="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20"
          >In Progress {stats.active.in_progress}</span
        >
        <span
          class="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/20"
          >Post Processing {stats.active.post_processing}</span
        >
      </div>
    </div>
    <!-- Project Priority List tags -->
    <div class="flex flex-row gap-1 w-1/3 items-center justify-center">
      <div class="flex flex-col gap-2">
        <span class="text-center p-2 text-md">Archived</span>

        <span
          class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
          >Done {stats.archived.done}</span
        >
        <span
          class="inline-flex items-center rounded-md bg-pink-400/10 px-2 py-1 text-xs font-medium text-pink-400 ring-1 ring-inset ring-pink-400/20"
          >Postponed {stats.archived.postponed}</span
        >
        <span
          class="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20"
          >Cancelled {stats.archived.cancelled}</span
        >
      </div>
    </div>
  </div>

  <!-- Interchangable Area -->
  <div>
    <!-- Opened project if a project README file is opened and this view is open or picked from project priority lish  -->

    <!-- <PieChart /> -->
    <!-- <hr /> -->
    <Accordian items={sections} />
  </div>
</section>
