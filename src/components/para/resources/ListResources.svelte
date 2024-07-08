<script lang="ts">
  import { writable } from "svelte/store";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onDestroy } from "svelte";
  import { PARAStore, plugin } from "../../../stores";
  import { TFile } from "obsidian";

  type ResourceType = {
    id: string;
    label: string;
    link: string;
  };
  let items: ResourceType[];
  const handleClick = async (link: string) => {
    if ($plugin) {
      const file = $plugin.app.vault.getFileByPath(link);
      if (file instanceof TFile) {
        await $plugin.app.workspace.getLeaf().openFile(file);
      }
    }
  };
  const unsub = PARAStore.subscribe(async (para) => {
    const resources = await para?.resources.getAllPARAFiles();
    if (resources) {
      items = resources.map((resource) => {
        return { id: resource.id, link: resource.link, label: resource.name };
      });
    }
  });

  onDestroy(unsub);
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
