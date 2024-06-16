<svelte:options immutable />

<script lang="ts">
  import { createSwitch, melt } from "@melt-ui/svelte";
  import type { field } from "svelte-forms";
  import { writable } from "svelte/store";

  export let initialState: boolean = false;
  export let inputField: ReturnType<typeof field>;
  export let state = writable<boolean>(initialState);
  const {
    elements: { root, input },
  } = createSwitch({
    checked: state,
  });

  $: inputField.set($state);
</script>

<div class="flex items-center">
  <span class="mr-3 text-sm" id="annual-billing-label">
    <span class="font-medium text-gray-900">Area</span>
  </span>
  <!-- Enabled: "bg-indigo-600", Not Enabled: "bg-gray-200" -->
  <button
    use:melt={$root}
    type="button"
    class:bg-magnum-600={$state}
    class="clickable-icon relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
    role="switch"
    aria-checked="false"
    aria-labelledby="annual-billing-label"
  >
    <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
    <span
      aria-hidden="true"
      class:translate-x-2={$state}
      class="pointer-events-none inline-block h-5 w-5 -translate-x-2 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
    ></span>
  </button>
  <input use:melt={$input} />
  <span class="ml-3 text-sm" id="annual-billing-label">
    <span class="font-medium text-gray-900">Sub-Area</span>
  </span>
</div>

<style>
  button {
    --w: 2.75rem;
    --padding: 0.125rem;
    width: var(--w);
  }
</style>
