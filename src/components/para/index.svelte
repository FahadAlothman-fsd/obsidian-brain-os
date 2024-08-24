<script lang="ts">
  import Tabs from "../UI/Tabs.svelte";
  import ProjectsTab from "./projects/index.svelte";
  import AreasTab from "./areas/index.svelte";
  import ResourcesTab from "./resources/index.svelte";
  import ArchivesTab from "./archives/index.svelte";
  import type { TabsType, tabIdType } from "../../types";
  import {
    ProjectEntryStore,
    AreaEntryStore,
    ResourceEntryStore,
  } from "../../stores";

  const triggers: TabsType = [
    {
      id: "projects-tab",
      title: "Projects",
      icon: "i-bxs-pen text-4 bg-magnum-400",
      component: ProjectsTab,
    },
    {
      id: "areas-tab",
      title: "Areas",
      icon: "i-bxs-package text-4 bg-magnum-400",
      component: AreasTab,
    },
    {
      id: "resources-tab",
      title: "Resources",
      icon: "i-bxs-book text-4 bg-magnum-400",
      component: ResourcesTab,
    },
    {
      id: "archives-tab",
      title: "Archives",
      icon: "i-bxs-archive text-4 bg-magnum-400",
      component: ArchivesTab,
    },
  ] as const;

  let tab: tabIdType<typeof triggers> = "project-tab";

  $: if ($ProjectEntryStore) {
    tab = "project-tab";
  }

  $: if ($AreaEntryStore) {
    tab = "area-tab";
  }

  $: if ($ResourceEntryStore) {
    tab = "resources-tab";
  }
</script>

<Tabs {triggers} />
