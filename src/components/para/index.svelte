<script lang="ts">
  import Tabs from "../UI/Tabs.svelte";
  import ProjectsTab from "./projects/index.svelte";
  import AreasTab from "./areas/index.svelte";
  import ResourcesTab from "./resources/index.svelte";
  import ArchivesTab from "./Archives.svelte";
  import type { TabsType } from "../../types";

  const triggers: TabsType = [
    {
      id: "tab-1",
      title: "Projects",
      icon: "i-bxs-pen text-4 bg-magnum-400",
      component: ProjectsTab,
    },
    {
      id: "tab-2",
      title: "Areas",
      icon: "i-bxs-package text-4 bg-magnum-400",
      component: AreasTab,
    },
    {
      id: "tab-3",
      title: "Resources",
      icon: "i-bxs-book text-4 bg-magnum-400",
      component: ResourcesTab,
    },
    {
      id: "tab-4",
      title: "Archives",
      icon: "i-bxs-archive text-4 bg-magnum-400",
      component: ArchivesTab,
    },
  ];
</script>

<Tabs {triggers} />
