<script lang="ts">
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onMount } from "svelte";
  import { areaStore, plugin } from "../../../stores";
  import { TFile } from "obsidian";
  import { get } from "svelte/store";

  type AreaType = {
    id: string;
    label: string;
    link: string;
  };
  let items: AreaType[];
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
      return {
        id: area.tag,
        link: area.README.path,
        label: area.tag,
      };
    });
  });
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
