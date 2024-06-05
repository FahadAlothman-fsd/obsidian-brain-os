<svelte:options immutable />

<script lang="ts">
  import { createTabs, melt } from "@melt-ui/svelte";
  import { cubicInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import type { TabsType } from "../../types";

  const {
    elements: { root, list, content, trigger },
    states: { value },
  } = createTabs({
    defaultValue: "tab-1",
  });

  let className =
    "flex items-center justify-center cursor-default select-none rounded-lg text-neutral-900 font-medium leading-none flex-1 h-12 px-2 focus:relative focus-visible:z-10 focus-visible:ring-2 data-[state=active]:focus:relative data-[state=active]:bg-white data-[state=active]:text-green";
  // export { className as class };

  export let triggers: TabsType;

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut,
  });
</script>

<div
  use:melt={$root}
  class="flex min-w-full flex-col overflow-hidden rounded-xl data-[orientation=vertical]:flex-row"
>
  <div
    use:melt={$list}
    class="flex shrink-0 overflow-x-auto gap-2
    data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r"
  >
    {#each triggers as triggerItem}
      <button
        use:melt={$trigger(triggerItem.id)}
        class={className + " relative clickable-icon"}
        aria-label={triggerItem.title}
      >
        <!-- {triggerItem.title} -->
        <i class={triggerItem.icon} />
        {#if $value === triggerItem.id}
          <div
            in:send={{ key: "trigger" }}
            out:receive={{ key: "trigger" }}
            class="absolute bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-magnum-400"
          />
        {/if}
      </button>
    {/each}
  </div>
  {#each triggers as triggerItem}
    <div use:melt={$content(triggerItem.id)} class={"grow py-4"}>
      <svelte:component this={triggerItem.component} />
    </div>
  {/each}
</div>
