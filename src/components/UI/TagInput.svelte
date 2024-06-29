<script lang="ts">
  import {
    createCombobox,
    createTagsInput,
    melt,
    type ComboboxOptionProps,
  } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";
  import { app, tagsStore } from "../../stores";
  import { derived } from "svelte/store";
  import { getAllTags } from "obsidian";
  import type { field } from "svelte-forms";

  export let title = "label";
  export let placeholder = "placeholder";
  export let error: boolean;
  export let inputField: ReturnType<typeof field<Tag[]>>;

  type Tag = {
    value: string;
    count: number;
  };
  const initialTags = $inputField.value ?? [];

  const {
    elements: { root, tag, deleteTrigger, edit },
    states: { tags },
    helpers: { addTag },
  } = createTagsInput({
    defaultTags: [],
    unique: true,
    add(tag) {
      return { id: tag, value: tag };
    },
    addOnPaste: true,
  });

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
    $inputValue = "";
    if ($selected?.label) {
      inputField.update((values) => {
        values.value.push({
          value: $selected.value.value,
          count: $selected.value.count,
        });
        return values;
      });
      addTag($selected.label);
      // $inputValue = $selected.label;
    }
  }

  $: filteredTags = $touchedInput
    ? $tagsStore.filter(({ value, count }) => {
        const normalizedInput = $inputValue.toLowerCase();
        return value.toLowerCase().includes(normalizedInput);
      })
    : $tagsStore;
</script>

<div class="flex flex-col items-start justify-center gap-2 min-w-full">
  <label for={$inputField.name}>
    <span class="text-sm font-medium text-magnum-900">{title}</span>
  </label>

  <div
    use:melt={$root}
    class="flex min-w-full flex-row flex-wrap gap-2.5 rounded-md bg-white px-3 py-2 text-magnum-700
    focus-within:ring focus-within:ring-magnum-400"
  >
    {#each $tags as t}
      <div
        use:melt={$tag(t)}
        class="clickable-icon flex items-center overflow-hidden rounded-md bg-magnum-200 text-magnum-900 [word-break:break-word]
      data-[disabled]:bg-magnum-300 data-[selected]:bg-magnum-400 data-[disabled]:hover:cursor-default
        data-[disabled]:focus:!outline-none data-[disabled]:focus:!ring-0"
      >
        <span class="flex items-center border-r border-white/10 px-1.5"
          >{t.value}</span
        >
        <button
          use:melt={$deleteTrigger(t)}
          class="clickable-icon flex h-full items-center px-1 enabled:hover:bg-magnum-300"
        >
          <i class="i-maki-cross text-3 text-black" />
        </button>
      </div>
      <div
        use:melt={$edit(t)}
        class="flex items-center overflow-hidden rounded-md px-1.5 [word-break:break-word] data-[invalid-edit]:focus:!ring-red-500"
      />
    {/each}

    <input
      use:melt={$input}
      type="text"
      {placeholder}
      class="min-w-[4.5rem] grow basis-0 border-0 text-black outline-none focus:!ring-0 data-[invalid]:text-red-500"
      style="background: transparent; border: none; color: black;"
    />
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
</div>
