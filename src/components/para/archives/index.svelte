<script lang="ts">
  import Accordian from "../../UI/Accordian.svelte";
  import { archiveStore, plugin } from "../../../stores";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { TFile } from "obsidian";
  import { get } from "svelte/store";
  import type { ComponentProps, ComponentType } from "svelte";

  let props: ComponentProps<Accordian> = {
    items: [],
  };

  $: if ($archiveStore) {
    props.items = [
      {
        id: "list-projects",
        title: "Projects",
        component: ScrollArea,
        props: {
          handleLinkClick: async (link: string) => {
            const brainOS = get(plugin);
            if (brainOS) {
              const file = brainOS.app.vault.getFileByPath(link);
              if (file instanceof TFile) {
                await brainOS.app.workspace.getLeaf().openFile(file);
              }
            }
          },
          items: $archiveStore.archived_projects.map((entry) => {
            return {
              id: entry.README.path.replace("/", "-"),
              link: entry.README.path,
              label: entry.README.basename,
            };
          }),
        },
      },
      {
        id: "list-areas",
        title: "Areas",
        component: ScrollArea,
        props: {
          handleLinkClick: async (link: string) => {
            const brainOS = get(plugin);
            if (brainOS) {
              const file = brainOS.app.vault.getFileByPath(link);
              if (file instanceof TFile) {
                await brainOS.app.workspace.getLeaf().openFile(file);
              }
            }
          },
          items: $archiveStore.archived_areas.map((entry) => {
            return {
              id: entry.README.path.replace("/", "-"),
              link: entry.README.path,
              label: entry.README.basename,
            };
          }),
        },
      },
      {
        id: "list-resources",
        title: "Resources",
        component: ScrollArea,

        props: {
          handleLinkClick: async (link: string) => {
            const brainOS = get(plugin);
            if (brainOS) {
              const file = brainOS.app.vault.getFileByPath(link);
              if (file instanceof TFile) {
                await brainOS.app.workspace.getLeaf().openFile(file);
              }
            }
          },
          items: $archiveStore.archived_resources.map((entry) => {
            return {
              id: entry.README.path.replace("/", "-"),
              link: entry.README.path,
              label: entry.README.basename,
            };
          }),
        },
      },
    ];
  }
  let items: typeof props.items = [];
</script>

<section class="space-y-2">
  <!-- Projects Header -->

  <div class="flex flex-row min-w-full rounded-lg bg-teal-500 p-2">
    <!-- Project  Header + buttons (add, delete, etc [some will only be available if a project is opened]) -->
    <div class="w-1/3 grid grid-cols-2 gap-2">
      <span class="col-span-2 text-center p-2 text-2xl">Archives</span>
      <button
        type="button"
        class="clickable-icon col-span-2 mx-auto rounded-full p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <i class="i-ph-plus-bold text-4" />
      </button>
      <!-- <button -->
      <!--   type="button" -->
      <!--   class="clickable-icon rounded-full p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" -->
      <!-- > -->
      <!--   <i class="i-ph-minus-bold text-4" /> -->
      <!-- </button> -->
    </div>
    <!-- Project Priority List tags -->
    <div class="w-2/3"></div>
  </div>

  <!-- Interchangable Area -->
  <div>
    <!-- Opened project if a project README file is opened and this view is open or picked from project priority lish  -->

    <Accordian items={props.items} />
    <!-- Active Projects with stats -->
    <!-- <ScrollArea {flavors} /> -->
  </div>
</section>
