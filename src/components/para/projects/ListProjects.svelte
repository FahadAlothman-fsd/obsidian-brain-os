<script lang="ts">
  import { writable } from "svelte/store";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onDestroy } from "svelte";
  import { PARAStore, plugin } from "../../../stores";
  import { TFile } from "obsidian";

  type ProjectType = {
    id: string;
    label: string;
    link: string;
  };
  let items: ProjectType[];
  const handleClick = async (link: string) => {
    if ($plugin) {
      const file = $plugin.app.vault.getFileByPath(link);
      if (file instanceof TFile) {
        await $plugin.app.workspace.getLeaf().openFile(file);
      }
    }
  };
  const unsub = PARAStore.subscribe(async (para) => {
    const projects = await para?.project.getAllPARAFiles();
    if (projects) {
      items = projects.map((project) => {
        return { id: project.id, link: project.link, label: project.name };
      });
    }
  });

  onDestroy(unsub);
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
