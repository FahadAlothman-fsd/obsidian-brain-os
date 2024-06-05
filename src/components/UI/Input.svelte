<script lang="ts">
  export let title = "label";
  export let placeholder = "placeholder";
  export let value: string;
</script>

<div class="flex flex-col gap-1">
  <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
  <label for={title}>
    <span class="text-sm font-medium text-magnum-900">{title}</span>
  </label>

  <div class="relative">
    <input
      bind:value
      class="flex h-10 items-center justify-between rounded-lg bg-white min-w-full
          px-3 pr-12 text-black"
      {placeholder}
    />
  </div>
</div>
