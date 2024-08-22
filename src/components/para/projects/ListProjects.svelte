<script lang="ts">
  import { get } from "svelte/store";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onMount } from "svelte";
  import { plugin, projectStore } from "../../../stores";
  import { TFile } from "obsidian";

  type ProjectType = {
    id: string;
    label: string;
    link: string;
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
      return {
        id: project.tag,
        link: project.README.path,
        label: project.tag,
      };
    });
  });
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
