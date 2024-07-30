<script lang="ts">
  import { cn } from "../../utils";
  import { createAccordion, melt } from "@melt-ui/svelte";
  import { slide } from "svelte/transition";

  const {
    elements: { content, item, trigger, root },
    helpers: { isSelected },
  } = createAccordion({
    defaultValue: "item-1",
  });

  export let items: any;

  let className = "";
  export { className as class };
</script>

<div
  class={cn(
    "mx-auto min-width-full max-w-full rounded-xl bg-white shadow-lg",
    className,
  )}
  {...$root}
>
  {#each items as { id, title, description, component, props }, i}
    <div
      use:melt={$item(id)}
      class="overflow-hidden transition-colors first:rounded-t-xl
            last:rounded-b-xl"
    >
      <h2 class="flex">
        <button
          use:melt={$trigger(id)}
          class={cn(
            "clickable-icon flex flex-1 cursor-pointer items-center justify-between ",
            "bg-white px-5 py-5 text-base font-medium leading-none",
            "text-black transition-colors hover:bg-neutral-100 focus:!ring-0",
            "focus-visible:text-magnum-800",
            i !== 0 && "border-t border-t-neutral-300",
          )}
        >
          {title}
        </button>
      </h2>
      {#if $isSelected(id)}
        <div
          class={cn(
            "content",
            "overflow-hidden bg-neutral-100 text-sm text-neutral-600 p-2",
          )}
          use:melt={$content(id)}
          transition:slide
        >
          {#if description}
            <div class="px-5 py-4">
              {description}
            </div>
          {:else if component}
            <svelte:component this={component} {...props} />
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  .content {
    box-shadow: inset 0px 1px 0px theme("colors.neutral.300");
  }
</style>
