<script lang="ts">
  export let color: string;
  export let isFilled: boolean;
  // export let isActive: boolean;
</script>

{#if isFilled}
  <i class={`i-ph-dot-outline-fill block text-6`} style={`color: ${color};`} />
{:else}
  <i
    class={`i-ph-dot-outline-light block text-6 `}
    style={`color: ${color};`}
  />
{/if}
<!-- <svg -->
<!--   class="inline h-[6px] w-[6px]" -->
<!--   class:active={isActive} -->
<!--   style="color:{color}" -->
<!--   viewBox="0 0 6 6" -->
<!--   xmlns="http://www.w3.org/2000/svg" -->
<!-- > -->
<!--   <circle -->
<!--     stroke={!isFilled ? "currentColor" : "none"} -->
<!--     fill={isFilled ? "currentColor" : "none"} -->
<!--     cx="3" -->
<!--     cy="3" -->
<!--     r="2" -->
<!--   ></circle> -->
<!-- </svg> -->
<!---->
<!-- <style> -->
<!--   .active { -->
<!--     color: var(--text-on-accent); -->
<!--   } -->
<!-- </style> -->
