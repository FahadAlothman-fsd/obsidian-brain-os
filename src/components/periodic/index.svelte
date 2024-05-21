<script lang="ts">
  import Tabs from "../UI/Tabs.svelte";
  import DailyTab from "./DayWeek.svelte";
  import MonthlyTab from "./Monthly.svelte";
  import QuarterlyTab from "./Quarterly.svelte";
  import YearlyTab from "./Yearly.svelte";
  import type { TabsType } from "../../types";

  // let className = "";
  // export { className as class };

  const triggers: TabsType = [
    {
      id: "tab-1",
      title: "Daily/Weekly",
      icon: "i-heroicons-calendar text-6 bg-magnum-400",
      component: DailyTab,
    },
    {
      id: "tab-2",
      title: "Monthly",
      icon: "i-material-symbols-background-grid-small text-6 bg-magnum-400",
      component: MonthlyTab,
    },
    {
      id: "tab-3",
      title: "Quarterly",
      icon: "i-teenyicons-grid-layout-outline text-4 bg-magnum-400",
      component: QuarterlyTab,
    },
    {
      id: "tab-4",
      title: "Yearly",
      icon: "i-material-symbols-grid-on-outline text-6 bg-magnum-400",
      component: YearlyTab,
    },
  ];
</script>

<Tabs {triggers} />
