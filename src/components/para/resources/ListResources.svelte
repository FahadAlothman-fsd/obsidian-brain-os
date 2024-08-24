<script lang="ts">
  import { get } from "svelte/store";
  import ScrollArea from "../../UI/ScrollArea.svelte";
  import { onMount } from "svelte";
  import { plugin, resourceStore } from "../../../stores";
  import { TFile } from "obsidian";

  type ResourceType = {
    id: string;
    label: string;
    link: string;
    end_chips: { id: string; text: string; color: string }[];
  };
  let items: ResourceType[];
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
    items = resourceStore.getEntries().map((resource) => {
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
    });
  });
</script>

<ScrollArea {items} handleLinkClick={handleClick} />
