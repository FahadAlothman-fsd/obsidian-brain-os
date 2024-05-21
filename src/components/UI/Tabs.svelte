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
    defaultValue: "tab-2",
  });

  let className =
    "flex items-center justify-center cursor-default select-none rounded-none bg-neutral-100 text-neutral-900 font-medium leading-none flex-1 h-12 px-2 focus:relative focus-visible:z-10 focus-visible:ring-2 data-[state=active]:focus:relative data-[state=active]:bg-white data-[state=active]:text-green";
  // export { className as class };

  export let triggers: TabsType;

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut,
  });
</script>

<div
  use:melt={$root}
  class="flex max-w-[25rem] flex-col overflow-hidden rounded-xl shadow-lg data-[orientation=vertical]:flex-row"
>
  <div
    use:melt={$list}
    class="flex shrink-0 overflow-x-auto bg-neutral-100
    data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r"
  >
    {#each triggers as triggerItem}
      <button
        use:melt={$trigger(triggerItem.id)}
        class={className + " relative"}
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
    <div
      use:melt={$content(triggerItem.id)}
      class={"grow bg-indigo-300 dark:bg-indigo-900 p-5 "}
    >
      <svelte:component this={triggerItem.component} />
    </div>
  {/each}
  <!-- <div use:melt={$content("tab-1")} class="grow bg-white p-5"> -->
  <!--   <p class="mb-5 leading-normal text-neutral-900"> -->
  <!--     Make changes to your account here. Click save when you're done. -->
  <!--   </p> -->
  <!--   <fieldset class="mb-4 flex w-full flex-col justify-start"> -->
  <!--     <label -->
  <!--       class="mb-2.5 block text-sm leading-none text-neutral-900" -->
  <!--       for="name" -->
  <!--     > -->
  <!--       Name -->
  <!--     </label> -->
  <!--     <input id="name" value="Thomas G. Lopes" /> -->
  <!--   </fieldset> -->
  <!---->
  <!--   <div class="mt-5 flex justify-end"> -->
  <!--     <button class="save">Save changes</button> -->
  <!--   </div> -->
  <!-- </div> -->
  <!-- <div use:melt={$content("tab-2")} class="grow bg-white p-5"> -->
  <!--   <p class="mb-5 leading-normal text-neutral-900"> -->
  <!--     Change your password here. Click save when you're done. -->
  <!--   </p> -->
  <!--   <fieldset class="mb-4 flex w-full flex-col justify-start"> -->
  <!--     <label -->
  <!--       class="mb-2.5 block text-sm leading-none text-neutral-900" -->
  <!--       for="newPassword" -->
  <!--     > -->
  <!--       New password -->
  <!--     </label> -->
  <!--     <input id="newPassword" type="password" /> -->
  <!--   </fieldset> -->
  <!--   <div class="mt-5 flex justify-end"> -->
  <!--     <button class="save">Save changes</button> -->
  <!--   </div> -->
  <!-- </div> -->
  <!-- <div use:melt={$content("tab-3")} class="grow bg-white p-5"> -->
  <!--   <p class="mb-5 leading-normal text-neutral-900"> -->
  <!--     Change your settings here. Click save when you're done. -->
  <!--   </p> -->
  <!---->
  <!--   <fieldset class="mb-4 flex w-full flex-col justify-start"> -->
  <!--     <label -->
  <!--       class="mb-2.5 block text-sm leading-none text-neutral-900" -->
  <!--       for="newEmail" -->
  <!--     > -->
  <!--       New email -->
  <!--     </label> -->
  <!--     <input id="newEmail" type="email" /> -->
  <!--   </fieldset> -->
  <!--   <div class="mt-5 flex justify-end"> -->
  <!--     <button class="save">Save changes</button> -->
  <!--   </div> -->
  <!-- </div> -->
</div>

<!-- <style lang="postcss"> -->
<!--   .trigger { -->
<!--     display: flex; -->
<!--     align-items: center; -->
<!--     justify-content: center; -->
<!---->
<!--     cursor: default; -->
<!--     user-select: none; -->
<!---->
<!--     border-radius: 0; -->
<!--     background-color: theme(colors.neutral.100); -->
<!---->
<!--     color: theme(colors.neutral.900); -->
<!--     font-weight: 500; -->
<!--     line-height: 1; -->
<!---->
<!--     flex: 1; -->
<!--     height: theme(spacing.12); -->
<!--     padding-inline: theme(spacing.2); -->
<!---->
<!--     &:focus { -->
<!--       position: relative; -->
<!--     } -->
<!---->
<!--     &:focus-visible { -->
<!--       @apply z-10 ring-2; -->
<!--     } -->
<!---->
<!--     &[data-state="active"] { -->
<!--       @apply focus:relative; -->
<!--       background-color: white; -->
<!--       color: theme("colors.magnum.900"); -->
<!--     } -->
<!--   } -->
<!---->
<!--   input { -->
<!--     height: theme(spacing.8); -->
<!--     flex-shrink: 0; -->
<!--     flex-grow: 1; -->
<!--     border-radius: theme(borderRadius.md); -->
<!--     border: 1px solid theme(colors.neutral.200); -->
<!--     padding-inline: theme(spacing[2.5]); -->
<!--     line-height: 1; -->
<!--     color: theme(colors.neutral.900); -->
<!---->
<!--     &:focus { -->
<!--       border-color: theme(colors.magnum.400); -->
<!--     } -->
<!--   } -->
<!---->
<!--   .save { -->
<!--     display: inline-flex; -->
<!--     height: theme(spacing.8); -->
<!--     cursor: default; -->
<!--     align-items: center; -->
<!--     justify-content: center; -->
<!--     border-radius: theme(borderRadius.md); -->
<!--     background-color: theme(colors.magnum.200); -->
<!--     padding-inline: theme(spacing.4); -->
<!--     line-height: 1; -->
<!--     font-weight: theme(fontWeight.semibold); -->
<!--     color: theme(colors.magnum.900); -->
<!--     @apply transition; -->
<!---->
<!--     &:hover { -->
<!--       opacity: 0.75; -->
<!--     } -->
<!---->
<!--     &:focus { -->
<!--       @apply !ring-green-600; -->
<!--     } -->
<!--   } -->
<!-- </style> -->
