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
  import { get } from "svelte/store";
  import { onDestroy } from "svelte";

  type TagComboInputType = {
    id: string; // will be used as the thing to retrieve the information the consumer of this componenet wants
    name: string;
    sub_title: string;
  };

  export let title = "label";
  export let placeholder = "placeholder";
  export let inputField: ReturnType<typeof field<TagComboInputType[]>>;
  export let prohibited_tag: string | undefined = undefined;

  export let filterTags: (
    touchedInput: boolean,
    inputValue: string,
    tags: Tag[],
    prohibited_tag: string | undefined,
  ) => TagComboInputType[] = (
    touchedInput,
    inputValue,
    tags,
    prohibited_tag: string | undefined,
  ) => {
    const areas = get(areaStore);
    return touchedInput
      ? areas
          .filter((val) => {
            return (
              !tags.some((tag) => tag.id === val.tag) &&
              val.tag !== prohibited_tag
            );
          })
          .filter(({ tag }) => {
            const normalizedInput = inputValue.toLowerCase();
            return tag.toLowerCase().includes(normalizedInput);
          })
          .map((val) => ({
            id: val.README.path,
            name: val.tag,
            sub_title: val.area_priority,
          }))
      : areas
          .filter((val) => {
            return (
              !tags.some((tag) => tag.id === val.tag) &&
              val.tag !== prohibited_tag
            );
          })
          .map((val) => ({
            id: val.README.path,
            name: val.tag,
            sub_title: val.area_priority,
          }));
  };

  export let addTagToInput: (
    tag: string,
    form_field: typeof inputField,
  ) => Tag | undefined = (tag, form_field) => {
    const brainOS = get(plugin);
    if (brainOS) {
      const area = areaStore.getEntryByTag(tag);
      if (area) {
        const input_field_values = get(inputField).value;
        form_field.set([
          ...input_field_values,
          {
            id: area.README.path,
            name: area.tag,
            sub_title: area.area_priority,
          },
        ]);
      }
      return {
        id: tag,
        value: tag.substring(brainOS.settings.para.areas.prefix.length),
      };
    }
  };

  export let removeTagFromInput: (
    tag: string,
    form_field: typeof inputField,
  ) => void = (tag, form_field) => {
    const brainOS = get(plugin);
    if (brainOS) {
      const area = areaStore.getEntryByTag(tag);
      if (area) {
        const input_field_values = get(form_field).value;
        input_field_values.remove({
          id: area.README.path,
          name: area.tag,
          sub_title: area.area_priority,
        });
        form_field.set(input_field_values);
      }
    }
  };

  let initialTags: Tag[] | undefined;
  const unsub = inputField.subscribe((val) => {
    initialTags =
      val.value.map((val) => ({ id: val.id, value: val.name })) || [];
  });

  console.log(prohibited_tag);

  // TODO: Changes to TagsInput
  // - make it dynamic such that any multiselect usage will use this component
  // - add to the remove func the removing from selected in combobox
  const {
    elements: { root, tag, deleteTrigger, edit },
    states: { tags },
    helpers: { addTag, removeTag },
  } = createTagsInput({
    defaultTags: initialTags,
    unique: true,
    add(tag) {
      console.log(addTagToInput(tag, inputField));
      let added_tag: Tag = addTagToInput(tag, inputField) || {
        id: tag,
        value: tag,
      };
      return added_tag;
    },
    remove(tag) {
      selected.set(undefined);
      removeTagFromInput(tag.id, inputField);

      return true;
    },
    addOnPaste: false,
  });

  const toOption = (
    tag: TagComboInputType,
  ): ComboboxOptionProps<TagComboInputType> => ({
    value: tag,
    label: tag.name,
  });

  const {
    elements: { menu, input, option },
    states: { open, inputValue, touchedInput, selected },
    helpers: { isSelected },
  } = createCombobox<TagComboInputType>({
    forceVisible: true,
  });

  $: if (!$open) {
    if (prohibited_tag && $tags.some((tag) => tag.id === prohibited_tag)) {
      removeTag({ id: prohibited_tag, value: prohibited_tag });
    }
    if ($selected && $selected.label) {
      let added_tag: Tag = {
        id: $selected.value.id,
        value: $selected.value.name,
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
        console.log($selected.value.id);
        addTag($selected.value.id);
      }
    }
  }

  $: filteredTags = filterTags(
    $touchedInput,
    $inputValue,
    $tags,
    prohibited_tag,
  );

  onDestroy(() => {
    unsub();
  });
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
              <span class="block text-sm opacity-75">{tag.sub_title}</span>
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
