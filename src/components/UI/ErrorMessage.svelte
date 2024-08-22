<script lang="ts">
  export let errors: string[];
  export let fieldName: string;
</script>

{#each errors as validationErrors}
  <p class="mt-2 text-sm text-red-600" id={`${fieldName}-error`}>
    {validationErrors}
  </p>
{/each}
