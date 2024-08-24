<script lang="ts">
  import { get } from "svelte/store";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onMount } from "svelte";
  import { plugin, projectStore } from "../../../stores";
  import { TFile } from "obsidian";
  import { StatusType } from "../../../utils";

  type ProjectType = {
    id: string;
    label: string;
    link: string;
    end_chips: { id: string; text: string; color: string }[];
  };
  let items: ProjectType[];
  const handleClick = async (link: string) => {
    const brainOS = get(plugin);
    if (brainOS) {
      const file = brainOS.app.vault.getFileByPath(link);
      if (file instanceof TFile) {
        await brainOS.app.workspace.getLeaf().openFile(file);
      }
    }
  };
  onMount(() => {
    items = projectStore.getEntries().map((project) => {
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
    });
  });
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
