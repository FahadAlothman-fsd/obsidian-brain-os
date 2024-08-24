<script lang="ts">
  import { createScrollArea, melt } from "@melt-ui/svelte";

  type itemType = {
    id: string;
    label: string;
    link?: string;
    end_chips: { text: string; color: string }[];
  };
  export let items: itemType[] = [];

  export let handleLinkClick: (link: string) => void;

  const {
    elements: {
      root,
      content,
      viewport,
      corner,
      scrollbarY,
      thumbY,
      thumbX,
      scrollbarX,
    },
  } = createScrollArea({
    type: "hover",
    dir: "ltr",
  });
</script>

<div
  use:melt={$root}
  class="relative h-72 min-w-full overflow-hidden rounded-md border bg-stone-500 text-magnum-900 shadow-lg"
>
  <div use:melt={$viewport} class="h-full w-full rounded-[inherit]">
    <div use:melt={$content}>
      <div class="p-4">
        {#each items as item (item.id)}
          <div class=" flex flex-row justify-between text-sm">
            <div>
              {#if item.link}
                <a
                  class="text-magnum-900 hover:text-magnum-400"
                  on:click={() => handleLinkClick(item.link ?? "")}
                >
                  {item.label}
                </a>
              {:else}
                {item.label}
              {/if}
            </div>
            <div class="flex flex-row justify-evenly gap-2">
              {#each item.end_chips as chip}
                <span
                  class={`inline-flex items-center rounded-md bg-${chip.color}-400/10 px-2 py-1 text-xs font-medium text-${chip.color}-400 ring-1 ring-inset ring-${chip.color}-400/20`}
                  >{chip.text}</span
                >
              {/each}
            </div>
          </div>
          <div role="separator" class="my-2 h-px w-full bg-magnum-600" />
        {/each}
      </div>
    </div>
  </div>
  <div
    use:melt={$scrollbarY}
    class="flex h-full w-2.5 touch-none select-none border-l border-l-transparent bg-magnum-800/10 p-px transition-colors"
  >
    <div
      use:melt={$thumbY}
      class="relative flex-1 rounded-full bg-magnum-600"
    />
  </div>
  <div
    use:melt={$scrollbarX}
    class="flex h-2.5 w-full touch-none select-none border-t border-t-transparent bg-magnum-800/10 p-px"
  >
    <div use:melt={$thumbX} class="relative rounded-full bg-magnum-600" />
  </div>
  <div use:melt={$corner} />
</div>
