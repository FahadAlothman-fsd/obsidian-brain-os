<script lang="ts">
  import { createCalendar, melt } from "@melt-ui/svelte";
  import { writable, derived, get } from "svelte/store";
  import { onDestroy } from "svelte";
  import { field, form } from "svelte-forms";
  import { createPeriodicFile } from "../../utils/periodic";
  import { plugin } from "../../stores";
  import { QUARTERLY } from "../../constants";
  import { Grid } from "../UI";
  import { moment } from "obsidian";
  import dayjs from "dayjs";
  let cols = 2;

  const {
    elements: { calendar, heading },
    states: { months, headingValue },
    helpers: { prevYear, nextYear },
  } = createCalendar({
    locale: window.localStorage.getItem("language") || "en",
  });

  let year: number;

  let grid: {
    id: string;
    title: string;
    active: boolean;
    // icon: string;
    // component: any;
  }[] = [];

  const year_unsub = headingValue.subscribe((value) => {
    year = Number(value.split(" ")[1]);
    // year = Math.floor(Number(value.split(" ")[1]) / 10) * 10;
    grid = [];

    console.log(`year: ${year}`);

    ["Q1", "Q2", "Q3", "Q4"].map((quarter, index) => {
      grid.push({
        id: `${year}-${index + 1}`,
        title: `${quarter}`,
        active: (index + 1) % 2 !== 0,
      });
    });
  });
  $: console.log($months);

  const handleCreateQuarterly = async (periodicFileName: string) => {
    const [year, quarter] = periodicFileName.split("-");
    const month = 1 + (Number(quarter) - 1) * 3;
    const date = dayjs(`${year}-${month}-01`, "YYYY-MM-DD");
    const brainOS = get(plugin);
    console.log(date);
    if (brainOS !== undefined) {
      console.log(periodicFileName);
      await createPeriodicFile(
        date,
        QUARTERLY,
        brainOS.settings.periodic.periodicFolder,
        brainOS.settings.periodic.quarterly.template,
        brainOS.app
      );
    }
  };

  onDestroy(() => {
    year_unsub();
  });
</script>

<section>
  <div
    use:melt={$calendar}
    class="w-full rounded-lg bg-magnum-100 p-3 text-magnum-800 shadow-sm"
  >
    <header class="flex items-center justify-between pb-2">
      <button
        on:click={(e) => {
          e.preventDefault();
          prevYear();
        }}
        class="clickable-icon rounded-lg p-1 bg-transparent hover:bg-fuchsia-300 hover:text-white"
      >
        <i class="i-heroicons-chevron-left-solid text-4 md:text-6 text-black" />
      </button>
      <div use:melt={$heading} class="font-semibold text-magnum-800">
        {year}
      </div>
      <button
        on:click={(e) => {
          e.preventDefault();
          nextYear();
        }}
        class="clickable-icon rounded-lg p-1 bg-transparent hover:bg-fuchsia-300 hover:text-white"
      >
        <i class="i-heroicons-chevron-right-solid md:text-6 text-black" />
      </button>
    </header>
    <div class="flex items-center gap-x-2">
      <Grid
        handleOnClick={handleCreateQuarterly}
        textSize="text-sm"
        {cols}
        {grid}
      />
    </div>
  </div>
</section>
