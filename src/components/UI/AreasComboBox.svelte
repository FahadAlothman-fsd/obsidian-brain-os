<svelte:options immutable />

<script lang="ts">
  import {
    createCombobox,
    melt,
    type ComboboxOptionProps,
    type CreateComboboxProps,
  } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";
  import type { field } from "svelte-forms";
  import { onMount } from "svelte";
  import { writable, type Unsubscriber } from "svelte/store";
  import { app, areaStore } from "../../stores";
  import type { AreaEntryType } from "../../types/paraTypes";

  // TODO: make this so the parent component passes the options
  export let title = "Label";
  export let placeholder = "Placeholder";
  export let error: boolean;
  export let inputField: ReturnType<typeof field<string>>;
  let area_tag: AreaEntryType | undefined;
  export let shouldOpen: (
    inputValue: string,
    selected: string,
  ) => boolean | undefined;

  const toOption = (
    tag: AreaEntryType,
  ): ComboboxOptionProps<{ tag: string; priority: string; name: string }> => ({
    value: {
      tag: tag.tag,
      priority: tag.area_priority,
      name: tag.README.basename.split(".")[0],
    },
    label: tag.tag,
  });

  let defaultSelected: CreateComboboxProps<{
    tag: string;
    priority: string;
    name: string;
  }>["defaultSelected"];

  $: if ($inputField.value) {
    let a_tag = $inputField.value.split("/").slice(0, -1).join("/");
    area_tag = areaStore.getAreaByTag(a_tag);

    console.log(area_tag);
    if (area_tag) {
      defaultSelected = toOption(area_tag);
      inputValue.set($inputField.value);
      console.log(defaultSelected);
    }
  }

  let unsubInputField: Unsubscriber | undefined;
  const handleOpen: CreateComboboxProps["onOpenChange"] = ({ next }) => {
    if (
      typeof shouldOpen !== undefined &&
      $selected &&
      $selected.label &&
      !shouldOpen($inputValue, $selected.label)
    ) {
      inputField.set($inputValue);
      unsubInputField = inputValue.subscribe((val) => {
        inputField.set(val);
      });
      return false;
    }
    if (!next) {
      $inputValue = $selected?.label ?? "";
      inputField.set($inputValue);
    }
    if (next && unsubInputField !== undefined) {
      unsubInputField();
      unsubInputField = undefined;
    }

    return next;
  };

  const {
    elements: { menu, input, option, label },
    states: { inputValue, open, touchedInput, selected },
    helpers: { isSelected },
  } = createCombobox<{ tag: string; priority: string; name: string }>({
    onOpenChange: handleOpen,
    defaultSelected,
  });

  $: console.log($selected);

  $: filteredTags = $touchedInput
    ? $areaStore.filter(({ tag }) => {
        const normalizedInput = $inputValue.toLowerCase();
        return tag.toLowerCase().includes(normalizedInput);
      })
    : $areaStore;

  onMount(() => areaStore.loadAreaEntires());
  // TODO: make it so that you can add a prefix and a suffix for the input that will let the use know
  // that the input will contain the prefix or suffix when submitted
</script>

<div class="flex flex-col gap-1">
  <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
  <label use:melt={$label}>
    <span class="text-sm font-medium text-magnum-900">{title}</span>
  </label>

  <div class="relative">
    <input
      use:melt={$input}
      class="flex h-10 items-center justify-between rounded-lg bg-white min-w-full
          px-3 pr-12 text-black"
      {placeholder}
    />

    {#each $inputField.errors as validationErrors}
      <p class="mt-2 text-sm text-red-600" id={`${$inputField.name}-error`}>
        {validationErrors}
      </p>
    {/each}
    <div class="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-magnum-900">
      {#if $open}
        <i class="i-heroicons-chevron-up-16-solid text-4" />
      {:else}
        <i class="i-heroicons-chevron-down-16-solid text-4" />
      {/if}
    </div>
  </div>
</div>
{#if $open}
  <ul
    class=" z-10 flex max-h-[300px] min-w-full flex-col overflow-hidden rounded-lg"
    use:melt={$menu}
    transition:fly={{ duration: 150, y: -5 }}
  >
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      class="flex max-h-full rounded-lg min-w-full flex-col gap-0 overflow-y-auto bg-white px-2 py-2 text-black"
      tabindex="0"
    >
      {#each filteredTags as tag, index (index)}
        <li
          use:melt={$option(toOption(tag))}
          class="relative cursor-pointer scroll-my-2 rounded-md py-2 pl-4 pr-4
        hover:bg-magnum-100
        data-[highlighted]:bg-magnum-200 data-[highlighted]:text-magnum-900
          data-[disabled]:opacity-50"
        >
          {#if $isSelected(tag)}
            <div
              class="absolute left-2 top-1/2 z-10 text-magnum-900"
              style="translate: calc(-50% + 1px);"
            >
              <i class="i-material-symbols-check-small text-4" />
            </div>
          {/if}
          <div class="pl-4">
            <span class="font-medium">{tag.tag}</span>
            <span class="block text-sm opacity-75">{tag.area_priority}</span>
          </div>
        </li>
      {:else}
        <li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">
          No results found
        </li>
      {/each}
    </div>
  </ul>
{/if}

<!-- <style lang="postcss"> -->
<!--   .check { -->
<!--     @apply absolute left-2 top-1/2 text-magnum-500; -->
<!--     translate: 0 calc(-50% + 1px); -->
<!--   } -->
<!-- </style> -->
