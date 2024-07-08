<script lang="ts">
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onDestroy } from "svelte";
  import { PARAStore, plugin } from "../../../stores";
  import { TFile } from "obsidian";

  type AreaType = {
    id: string;
    label: string;
    link: string;
  };
  let items: AreaType[];
  const handleClick = async (link: string) => {
    if ($plugin) {
      const file = $plugin.app.vault.getFileByPath(link);
      if (file instanceof TFile) {
        await $plugin.app.workspace.getLeaf().openFile(file);
      }
    }
  };
  const unsub = PARAStore.subscribe(async (para) => {
    const areas = await para?.area.getAllPARAFiles();
    if (areas) {
      items = areas.map((area) => {
        return { id: area.id, link: area.link, label: area.name };
      });
    }
  });

  onDestroy(unsub);
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
