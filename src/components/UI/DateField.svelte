<script lang="ts">
  import { CalendarDate, parseDate } from "@internationalized/date";
  import {
    createDateField,
    melt,
    type CreateDateFieldProps,
  } from "@melt-ui/svelte";
  import { onDestroy } from "svelte";
  import { field as fd } from "svelte-forms";
  import { get } from "svelte/store";
  import ErrorMessage from "./ErrorMessage.svelte";

  export let title = "label";
  export let inputField: ReturnType<typeof fd<string>>;
  let date: number[] = [];
  export let defaultValue: CreateDateFieldProps["defaultValue"];

  $: if ($inputField.value) {
    date = $inputField.value.split("-").map((val) => Number(val));
    defaultValue =
      date.length > 0 ? new CalendarDate(date[0], date[1], date[2]) : undefined;
  }

  let todayDate: CreateDateFieldProps["minValue"] = parseDate(
    window.moment().format("YYYY-MM-DD").toString(),
  );

  const {
    elements: { field, segment, label, hiddenInput, validation },
    states: { value, segmentContents, isInvalid },
  } = createDateField({
    name: title,
    defaultValue,
    minValue: todayDate,
  });

  const unsub = value.subscribe((value) => {
    if (value) {
      const invalid = get(isInvalid);
      inputField.update((val) => ({
        ...val,
        value: value.toString(),
        valid: !invalid,
      }));
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
{#if $isInvalid}
  <small class="self-start text-red-500" use:melt={$validation}>
    Date cannot be earlier than today ({todayDate.toString()})
  </small>
{/if}
<ErrorMessage errors={$inputField.errors} fieldName={$inputField.name} />
