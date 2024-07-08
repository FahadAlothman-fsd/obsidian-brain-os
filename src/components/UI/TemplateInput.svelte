<script lang="ts">
  import {
    createCombobox,
    createTagsInput,
    melt,
    type ComboboxOptionProps,
  } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";
  import { templateStore, type templateType } from "../../stores";
  import type { field } from "svelte-forms";

  export let title = "label";
  export let placeholder = "placeholder";
  export let error: boolean;
  export let inputField: ReturnType<typeof field<templateType[]>>;

  const initialTags = $inputField.value || [];

  const {
    elements: { root, tag, deleteTrigger, edit },
    states: { tags },
    helpers: { addTag },
  } = createTagsInput({
    // @ts-ignore for some reason the type doesn't work
    defaultTags: initialTags,
    unique: true,
    add(tag) {
      return { id: tag, value: tag };
    },
    addOnPaste: true,
  });

  const toOption = (
    template: templateType,
  ): ComboboxOptionProps<templateType> => ({
    value: template,
    label: template.name,
  });

  const {
    elements: { menu, input, option },
    states: { open, inputValue, touchedInput, selected },
    helpers: { isSelected },
  } = createCombobox<templateType>({
    forceVisible: true,
  });

  $: if (!$open) {
    $inputValue = "";
    if ($selected?.label) {
      inputField.update((values) => {
        values.value.push({
          ...$selected.value,
        });
        return values;
      });
      addTag($selected.label);
      // $inputValue = $selected.label;
    }
  }

  $: filteredTags = $touchedInput
    ? $templateStore.filter(({ name }) => {
        const normalizedInput = $inputValue.toLowerCase();
        return name.toLowerCase().includes(normalizedInput);
      })
    : $templateStore;
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
      class="min-w-full basis-0 border-0 text-black outline-none focus:!ring-0 data-[invalid]:text-red-500"
      style="background: transparent; border: none; color: black;"
    />
  </div>

  {#if $open}
    <ul
      class=" z-10 flex max-h-[300px] min-w-full flex-col overflow-hidden rounded-lg pl-0"
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
              <span class="font-medium">{tag.name}</span>
              <span class="block text-sm opacity-75">{tag.parent?.name}</span>
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
