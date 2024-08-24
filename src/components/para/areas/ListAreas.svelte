<script lang="ts">
  import { get } from "svelte/store";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onMount } from "svelte";
  import { plugin, areaStore } from "../../../stores";
  import { TFile } from "obsidian";

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
    items = areaStore.getEntries().map((area) => {
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
    });
  });
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
