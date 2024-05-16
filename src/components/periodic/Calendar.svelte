<script lang="ts">
  import { createCalendar, melt } from "@melt-ui/svelte";

  const {
    elements: { calendar, heading, grid, cell, prevButton, nextButton },
    states: { months, headingValue, weekdays },
    helpers: { isDateDisabled, isDateUnavailable, prevYear, nextYear },
  } = createCalendar();
</script>

<section>
  <div
    use:melt={$calendar}
    class="w-full rounded-lg bg-magnum-100 p-3 text-magnum-800 shadow-sm"
  >
    <header class="flex items-center justify-between pb-2">
      <button
        use:melt={$prevButton}
        class="rounded-lg p-1 transition-all bg-magnum-300 hover:bg-magnum-100"
      >
        <i class="i-heroicons-chevron-left-solid text-4" />
      </button>
      <div use:melt={$heading} class="font-semibold text-magnum-800">
        {$headingValue}
      </div>
      <button
        use:melt={$nextButton}
        class="rounded-lg p-1 transition-all hover:bg-magnum-100"
      >
        <i class="i-heroicons-chevron-right-solid text-4" />
      </button>
    </header>
    <div class="flex items-center gap-8">
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
                  aria-disabled={$isDateDisabled(weekDates[0]) ||
                    $isDateUnavailable(weekDates[0])}
                >
                  <div
                    use:melt={$cell(weekDates[0], month.value)}
                    class="flex h-6 w-6 cursor-pointer select-none items-center justify-center rounded-lg p-4 hover:bg-magnum-100 focus:ring focus:ring-magnum-400 data-[outside-visible-months]:pointer-events-none data-[outside-visible-months]:cursor-default data-[range-highlighted]:bg-magnum-200 data-[selected]:bg-magnum-300 data-[selected]:text-magnum-900 data-[disabled]:opacity-40 data-[outside-visible-months]:opacity-40 data-[outside-visible-months]:hover:bg-transparent"
                  >
                    {weekDates[0].day}
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
