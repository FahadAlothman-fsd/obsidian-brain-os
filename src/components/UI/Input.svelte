<script lang="ts">
  import { field } from "svelte-forms";

  export let title = "label";
  export let placeholder = "placeholder";
  export let error: boolean = false;
  export let inputField: ReturnType<typeof field>;
</script>

<div class="flex flex-col gap-1">
  <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
  <label for={$inputField.name}>
    <span class="text-sm font-medium text-magnum-900">{title}</span>
  </label>

  <div class="relative">
    <input
      bind:value={$inputField.value}
      class="flex h-10 items-center justify-between rounded-lg bg-white min-w-full
          px-3 pr-12 ring-1 text-black"
      class:focus:ring-2={error}
      class:ring-inset={error}
      class:ring-red-300={error}
      class:text-red-900={error}
      {placeholder}
    />
    {#each $inputField.errors as validationErrors}
      <p class="mt-2 text-sm text-red-600" id={`${$inputField.name}-error`}>
        {validationErrors}
      </p>
    {/each}
    <!-- {#if $inputField.errors} -->
    <!--   <p class="mt-2 text-sm text-red-600" id={`${$inputField.name}-error`}> -->
    <!--     Not a valid {title}. -->
    <!--   </p> -->
    <!-- {/if} -->
  </div>
</div>
