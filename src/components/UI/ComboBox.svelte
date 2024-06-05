<script lang="ts">
  import {
    createCombobox,
    melt,
    type ComboboxOptionProps,
  } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";
  import { app, tagsStore } from "../../stores";

  export let title = "Label";
  export let placeholder = "Placeholder";
  export let value: string;

  type Tag = {
    value: string;
    count: number;
  };

  const toOption = (tag: Tag): ComboboxOptionProps<Tag> => ({
    value: tag,
    label: tag.value,
  });

  const {
    elements: { menu, input, option, label },
    states: { open, inputValue, touchedInput, selected },
    helpers: { isSelected },
  } = createCombobox<Tag>({
    forceVisible: true,
  });

  $: if (!$open) {
    if (
      $selected &&
      $inputValue.substring(0, $inputValue.lastIndexOf("/")) === $selected.label
    ) {
      $inputValue = $inputValue;
    } else if ($selected) {
      $inputValue = $selected.label ?? "";
    }
  }

  $: filteredTags = $touchedInput
    ? $tagsStore.filter(({ value, count }) => {
        const normalizedInput = $inputValue.toLowerCase();
        return value.toLowerCase().includes(normalizedInput);
      })
    : $tagsStore;
</script>

<div class="flex flex-col gap-1">
  <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
  <label use:melt={$label}>
    <span class="text-sm font-medium text-magnum-900">{title}</span>
  </label>

  <div class="relative">
    <input
      use:melt={$input}
      bind:value
      class="flex h-10 items-center justify-between rounded-lg bg-white min-w-full
          px-3 pr-12 text-black"
      {placeholder}
    />
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
            <span class="font-medium">{tag.value}</span>
            <span class="block text-sm opacity-75">{tag.count}</span>
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
