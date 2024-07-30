<script lang="ts">
  import { CalendarDate } from "@internationalized/date";
  import {
    createDateField,
    melt,
    type CreateDateFieldProps,
  } from "@melt-ui/svelte";
  import { onDestroy } from "svelte";
  import { field as fd } from "svelte-forms";

  export let title = "label";
  export let error: boolean;
  export let inputField: ReturnType<typeof fd<string>>;
  let date: number[] = [];
  export let defaultValue: CreateDateFieldProps["defaultValue"];

  $: if ($inputField.value) {
    date = $inputField.value.split("-").map((val) => Number(val));
    console.log(date);
    defaultValue =
      date.length > 0 ? new CalendarDate(date[0], date[1], date[2]) : undefined;
  }
  $: console.log(defaultValue);
  const {
    elements: { field, segment, label, hiddenInput, validation },
    states: { value, segmentContents, isInvalid },
  } = createDateField({
    name: title,
    defaultValue,
  });

  const unsub = value.subscribe((value) => {
    if (value) {
      inputField.set(value.toString());
    }
  });

  onDestroy(unsub);
</script>

<div class="flex w-full flex-col gap-3">
  <span
    class="
    data-[data-melt-datefield-label]:select-none
    data-[data-melt-datefield-label]:font-medium
    data-[data-melt-datefield-label]:text-white
    data-invalid:text-red-500
    "
    use:melt={$label}>{title}</span
  >
  <div
    use:melt={$field}
    class="
    mt-1.5 flex w-full min-w-[200px] items-center rounded-lg
    border border-magnum-400/60 bg-white p-1.5 text-black
    data-invalid:border-red-400
    "
  >
    {#each $segmentContents as seg, i (i)}
      <div use:melt={$segment(seg.part)}>
        {seg.value}
      </div>
    {/each}
  </div>
  <input use:melt={$hiddenInput} />
</div>
{#if $isInvalid || error}
  <small class="self-start text-red-500" use:melt={$validation}>
    Date cannot be on the 1st or 15th of the month.
  </small>
{/if}
<p class="w-full text-left text-sm font-medium text-neutral-200">
  You Selected:
  {#if $value}
    {$value}
  {/if}
</p>
