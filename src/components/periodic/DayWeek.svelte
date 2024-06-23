<script lang="ts">
  import { createCalendar, melt } from "@melt-ui/svelte";
  import { writable, derived, get } from "svelte/store";
  import { onDestroy } from "svelte";
  import { field, form } from "svelte-forms";
  import { createPeriodicFile, getISOWeekNumber } from "../../utils/periodic";
  import { plugin } from "../../stores";
  import { DAILY, WEEKLY } from "../../constants";
  import {
    CalendarDate,
    CalendarDateTime,
    ZonedDateTime,
    endOfWeek,
    getLocalTimeZone,
    now,
    parseDateTime,
    startOfWeek,
    type DateValue,
  } from "@internationalized/date";
  import { moment } from "obsidian";

  const day = field("day", "");
  const week = field("week", "");

  const dayWeekForm = form(day);

  const {
    elements: { calendar, heading, grid, cell, prevButton, nextButton },
    states: { months, headingValue, weekdays, value },
    helpers: { isDateDisabled, isDateUnavailable },
  } = createCalendar({
    locale: window.localStorage.getItem("language") || "en",
  });

  $: if ($value) {
    const brainOS = get(plugin);
    // TODO: display error here indicating that the brainOS wasn't added correctly
    if (brainOS !== undefined) {
      createPeriodicFile(
        window.moment($value.toDate(getLocalTimeZone())),
        DAILY,
        brainOS.settings.periodic.periodicFolder,
        brainOS.settings.periodic.daily.template,
        brainOS.app
      );
    }
  }

  const handleCreateWeekly = async (startOfWeek: DateValue) => {
    const date = window.moment(startOfWeek, "YYYY-M-DD");
    const brainOS = get(plugin);
    if (brainOS !== undefined) {
      await createPeriodicFile(
        date,
        WEEKLY,
        brainOS.settings.periodic.periodicFolder,
        brainOS.settings.periodic.weekly.template,
        brainOS.app
      );
    }
  };
</script>

<section>
  <div
    use:melt={$calendar}
    class="w-full rounded-lg bg-magnum-100 p-3 text-magnum-800 shadow-sm"
  >
    <header class="flex items-center justify-between pb-2">
      <button
        use:melt={$prevButton}
        class="clickable-icon rounded-lg p-1 bg-transparent hover:bg-fuchsia-300 hover:text-white"
      >
        <i class="i-heroicons-chevron-left-solid text-4 md:text-6 text-black" />
      </button>
      <div use:melt={$heading} class="font-semibold text-magnum-800">
        {$headingValue}
      </div>
      <button
        use:melt={$nextButton}
        class="clickable-icon rounded-lg p-1 bg-transparent hover:bg-fuchsia-300 hover:text-white"
      >
        <i class="i-heroicons-chevron-right-solid md:text-6 text-black" />
      </button>
    </header>
    <div class="flex items-center">
      {#each $months as month}
        <table use:melt={$grid} class="w-full">
          <thead aria-hidden="true">
            <tr>
              <th class="text-sm font-semibold text-magnum-800">
                <div class="flex h-6 w-6 items-center justify-center p-4">
                  W
                </div>
              </th>
              {#each $weekdays as day}
                <th class="text-sm font-semibold text-magnum-800">
                  <div class="flex h-6 w-6 items-center justify-center p-4">
                    {day}
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each month.weeks as weekDates}
              <tr>
                <td
                  role="gridcell"
                  class="border-r-[2px] border-r-magnum-400 border-r-solid"
                >
                  <div
                    role="button"
                    on:click={async (e) => {
                      await handleCreateWeekly(
                        startOfWeek(weekDates[0], window.moment().locale())
                      );
                    }}
                    class="flex h-6 w-6 cursor-pointer select-none items-center justify-center rounded-lg p-4 hover:bg-magnum-300 focus:ring focus:ring-magnum-400"
                  >
                    {getISOWeekNumber(
                      startOfWeek(weekDates[0], moment.locale())
                    )}
                  </div>
                </td>

                {#each weekDates as date}
                  <td
                    role="gridcell"
                    aria-disabled={$isDateDisabled(date) ||
                      $isDateUnavailable(date)}
                  >
                    <div
                      use:melt={$cell(date, month.value)}
                      class="flex h-6 w-6 cursor-pointer select-none items-center justify-center rounded-lg p-4 hover:bg-magnum-100 focus:ring focus:ring-magnum-400 data-[outside-visible-months]:pointer-events-none data-[outside-visible-months]:cursor-default data-[range-highlighted]:bg-magnum-200 data-[selected]:bg-magnum-300 data-[selected]:text-magnum-900 data-[disabled]:opacity-40 data-[outside-visible-months]:opacity-40 data-[outside-visible-months]:hover:bg-transparent"
                    >
                      {date.day}
                    </div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      {/each}
    </div>
  </div>
</section>
