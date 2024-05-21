<svelte:options immutable />

<script lang="ts">
  export let size = 4;

  export let grid: {
    id: string;
    title: string;
    // icon: string;
    // component: any;
  }[];
  $: cols = size <= 4 ? 2 : 3;
</script>

<div class="mx-auto max-w-7xl">
  <div
    class={`-mx-6 grid grid-cols-${cols} gap-4 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-${cols}`}
  >
    {#each grid as gridSegment (gridSegment.id)}
      <div
        class="bg-indigo-600 hover:rounded-2xl p-8 sm:p-4 flex justify-center items-center hover:bg-pink-500 transition-spacing duration-300 hover:-m-2"
      >
        <span class="text-2xl p-5">{gridSegment.title}</span>
      </div>
    {/each}
  </div>
</div>
