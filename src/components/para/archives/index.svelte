<script lang="ts">
  import Accordian from "../../UI/Accordian.svelte";
  import { archiveStore, plugin } from "../../../stores";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { TFile } from "obsidian";
  import { get } from "svelte/store";
  import type { ComponentProps } from "svelte";
  import { StatusType } from "../../../utils";

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
          items: $archiveStore.archived_projects.map((project) => {
            const brainOS = get(plugin);
            return {
              id: project.tag,
              link: project.README.path,
              label: project.tag.substring(project.tag.lastIndexOf("/") + 1),
              end_chips: [
                {
                  id: "project-area-badge",
                  text: project.tag.substring(
                    brainOS ? brainOS.settings.para.areas.prefix.length : 0,
                    project.tag.lastIndexOf("/"),
                  ),
                  color: "yellow",
                },
                {
                  id: "project-status-badge",
                  text: project.project_status.name,
                  color: ((type: typeof project.project_status.type) => {
                    switch (type) {
                      case StatusType.NEW:
                        return "green";
                      default:
                        return "blue";
                    }
                  })(project.project_status.type),
                },
              ],
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
          items: $archiveStore.archived_areas.map((area) => {
            const brainOS = get(plugin);
            let sub_area_chip;
            let offset = 0;
            if (area.tag.split("/").length === 1) {
              offset = brainOS ? brainOS.settings.para.areas.prefix.length : 0;
            } else {
              sub_area_chip = {
                id: "sub_area-area-badge",
                text: area.tag.substring(
                  brainOS ? brainOS.settings.para.areas.prefix.length : 0,
                  area.tag.lastIndexOf("/"),
                ),
                color: "yellow",
              };
            }
            return {
              id: area.tag,
              link: area.README.path,
              label: area.tag.substring(area.tag.lastIndexOf("/") + 1 + offset),
              end_chips: sub_area_chip ? [sub_area_chip] : [],
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
          items: $archiveStore.archived_resources.map((resource) => {
            const brainOS = get(plugin);
            return {
              id: resource.tag,
              link: resource.README.path,
              label: resource.tag.substring(
                brainOS ? brainOS.settings.para.resources.prefix.length : 0,
              ),
              end_chips: [
                {
                  id: `${resource.tag.substring(brainOS ? brainOS.settings.para.resources.prefix.length : 0)}`,
                  text: `${resource.resources?.length}` || "0",
                  color: "yellow",
                },
              ],
            };
          }),
        },
      },
    ];
  }
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
