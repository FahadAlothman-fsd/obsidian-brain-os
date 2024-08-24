<script lang="ts">
  import { createCalendar, melt } from "@melt-ui/svelte";
  import { get } from "svelte/store";
  import { onDestroy } from "svelte";
  import { createPeriodicFile } from "../../utils/periodic";
  import { plugin } from "../../stores";
  import { YEARLY } from "../../constants";
  import { Grid } from "../UI";
  import { TFile } from "obsidian";
  let cols = 3;

  const {
    elements: { calendar, heading },
    states: { months, headingValue },
    helpers: { setYear },
  } = createCalendar({
    locale: window.localStorage.getItem("language") || "en",
  });

  let year: number;

  type gridItemType = {
    id: string;
    title: string;
    active: boolean;
    // icon: string;
    // component: any;
  };
  let grid: gridItemType[] = [];

  const year_unsub = headingValue.subscribe((value) => {
    year = Number(value.split(" ")[1]);
    year = Math.floor(year / 10) * 10;
    let years = [];
    let end_of_decade = year + 10;
    let index = year - 1;
    grid = [];
    while (index <= end_of_decade) {
      years.push(index);
      index++;
    }

    years.map((yearValue, index) => {
      let item: gridItemType = {
        id: `${yearValue}`,
        title: `${yearValue}`,
        active: false,
      };
      const brainOS = get(plugin);
      if (brainOS) {
        const file = brainOS.app.vault.getFileByPath(
          `${brainOS.settings.periodic.periodicFolder}/${yearValue}/${yearValue}.md`,
        );
        if (file instanceof TFile) {
          item.active = true;
        }
      }
      grid.push(item);
    });
  });

  const handleCreateYearly = async (periodicFileName: string) => {
    const date = window.moment(`${periodicFileName}-06-12`, "YYYY-MM-DD");
    const brainOS = get(plugin);
    if (brainOS !== undefined) {
      const file = await createPeriodicFile(
        date,
        YEARLY,
        brainOS.settings.periodic.periodicFolder,
        brainOS.settings.periodic.yearly.template,
        brainOS.app,
      );

      if (file instanceof TFile) {
        await brainOS.app.workspace.getLeaf().openFile(file);
      }
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
          setYear(year - 10);
        }}
        class="clickable-icon rounded-lg p-1 bg-transparent hover:bg-fuchsia-300 hover:text-white"
      >
        <i class="i-heroicons-chevron-left-solid text-4 md:text-6 text-black" />
      </button>
      <div use:melt={$heading} class="font-semibold text-magnum-800">
        {year - 1}-{year + 10}
      </div>
      <button
        on:click={(e) => {
          e.preventDefault();
          setYear(year + 10);
        }}
        class="clickable-icon rounded-lg p-1 bg-transparent hover:bg-fuchsia-300 hover:text-white"
      >
        <i class="i-heroicons-chevron-right-solid md:text-6 text-black" />
      </button>
    </header>
    <div class="flex items-center gap-x-2">
      <Grid
        handleOnClick={handleCreateYearly}
        textSize="text-sm"
        {cols}
        {grid}
      />
    </div>
  </div>
</section>
