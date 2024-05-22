<svelte:options immutable />

<script lang="ts">
  import Dot from "./Dot.svelte";
  export let cols = 2;

  export let grid: {
    id: string;
    title: string;
    active: boolean;
    // icon: string;
    // component: any;
  }[];
  export let textSize: string = "text-xl";
  let gridClass = `grid p-2 gap-4 overflow-hidden`;
  let gridSizeClass = `grid-template-columns: repeat(${cols}, minmax(0, 1fr));`;
  console.log(cols);
</script>

<div role="grid" class="mx-auto">
  <div class={gridClass} style={gridSizeClass}>
    {#each grid as gridSegment (gridSegment.id)}
      <div
        class={` ${gridSegment.active ? "bg-purple-400 rounded-lg -m-1.5" : "hover:rounded-lg hover:-m-1.5 bg-transparent"} sm:p-4 flex justify-center items-center hover:bg-pink-500 transition-rounding transition-spacing duration-300`}
        on:click={(e) => {
          console.log(e);
          console.log(cols);
        }}
        tabindex="-1"
        role="gridcell"
      >
        {#if gridSegment.active}
          <div class="grid grid-rows-3 space-evenly grid-flow-col min-w-full">
            <div class="m-auto">
              <Dot color="black" isFilled={true} />
            </div>

            <div class="m-auto">
              <Dot color="#fbbf24" isFilled={false} />
            </div>
            <div class="m-auto">
              <Dot color="white" isFilled={true} />
            </div>
            <div class="m-auto">
              <Dot color="#ef4444" isFilled={false} />
            </div>

            <div class="m-auto">
              <span
                class={`${textSize} ${gridSegment.active ? "text-black" : "text-white"}`}
                >{gridSegment.title}</span
              >
            </div>

            <div class="m-auto">
              <Dot color="white" isFilled={true} />
            </div>
            <div class="m-auto">
              <Dot color="white" isFilled={false} />
            </div>
            <div class="m-auto">
              <Dot color="white" isFilled={true} />
            </div>
            <div class="m-auto">
              <Dot color="white" isFilled={false} />
            </div>
          </div>
        {:else}
          <div class="m-auto">
            <span class={`${textSize}`}>{gridSegment.title}</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
