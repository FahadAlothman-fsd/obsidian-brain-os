<script lang="ts">
  import {
    createCombobox,
    createTagsInput,
    melt,
    type ComboboxOptionProps,
    type Tag,
  } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";
  import { areaStore, plugin } from "../../stores";
  import type { field } from "svelte-forms";

  export let title = "label";
  export let placeholder = "placeholder";
  export let inputField: ReturnType<typeof field<relatedAreaType[]>>;
  export let prohibited_tag: string;

  type relatedAreaType = {
    tag: string;
    priority: string;
  };
  console.log($inputField);
  const initialTags =
    $inputField.value.map((val) => ({ id: val.tag, value: val.tag })) || [];

  const {
    elements: { root, tag, deleteTrigger, edit },
    states: { tags },
    helpers: { addTag },
  } = createTagsInput({
    defaultTags: initialTags,
    unique: true,
    add(tag) {
      let added_tag: Tag = {
        id: tag,
        value: tag,
      };
      if ($plugin) {
        const area = areaStore.getAreaByTag(tag);
        if (area) {
          $inputField.value.push({
            tag: area.tag,
            priority: area.area_priority,
          });
        }
        added_tag = {
          ...added_tag,
          value: added_tag.id.substring(
            $plugin.settings.para.areas.prefix.length,
          ),
        };
      }
      return added_tag;
    },
    remove(tag) {
      $selected = undefined;
      if ($plugin) {
        const area = areaStore.getAreaByTag(tag.id);
        if (area) {
          $inputField.value.remove({
            tag: area.tag,
            priority: area.area_priority,
          });
        }
      }

      return true;
    },
    addOnPaste: false,
  });

  const toOption = (
    tag: relatedAreaType,
  ): ComboboxOptionProps<relatedAreaType> => ({
    value: tag,
    label: tag.tag,
  });

  const {
    elements: { menu, input, option },
    states: { open, inputValue, touchedInput, selected },
    helpers: { isSelected },
  } = createCombobox<relatedAreaType>({
    forceVisible: true,
  });

  $: if (!$open) {
    if ($selected?.label) {
      let added_tag: Tag = {
        id: $selected.value.tag,
        value: $selected.value.tag,
      };
      if ($plugin) {
        added_tag = {
          ...added_tag,
          value: added_tag.id.substring(
            $plugin.settings.para.areas.prefix.length,
          ),
        };
      }
      if (!$tags.some((val) => val.id === added_tag.id)) {
        addTag($selected.value.tag);
      }
    }
  }

  $: filteredTags = $touchedInput
    ? $areaStore
        .filter(({ tag }) => {
          const normalizedInput = $inputValue.toLowerCase();
          return tag.toLowerCase().includes(normalizedInput);
        })
        .map((val) => ({ tag: val.tag, priority: val.area_priority }))
    : $areaStore
        .filter((val) => {
          return (
            !$tags.some((tag) => tag.id === val.tag) &&
            val.tag !== prohibited_tag
          );
        })
        .map((val) => ({ tag: val.tag, priority: val.area_priority }));
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
              <span class="font-medium">{tag.tag}</span>
              <span class="block text-sm opacity-75">{tag.priority}</span>
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
