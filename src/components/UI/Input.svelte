<script lang="ts">
  import { field } from "svelte-forms";
  import ErrorMessage from "./ErrorMessage.svelte";

  export let title = "label";
  export let placeholder = "placeholder";
  export let inputField: ReturnType<typeof field>;
  export let disabled: boolean = false;
</script>

<div class="flex flex-col gap-1">
  <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
  <label for={$inputField.name}>
    <span class="text-sm font-medium text-magnum-900">{title}</span>
  </label>

  <div class="relative">
    <input
      {disabled}
      bind:value={$inputField.value}
      class="flex h-10 items-center justify-between rounded-lg bg-white min-w-full
          px-3 pr-12 ring-1 text-black"
      class:focus:ring-2={$inputField.errors.length > 0}
      class:ring-inset={$inputField.errors.length > 0}
      class:ring-red-300={$inputField.errors.length > 0}
      class:text-red-900={$inputField.errors.length > 0}
      {placeholder}
    />
    <ErrorMessage errors={$inputField.errors} fieldName={$inputField.name} />
  </div>
</div>
