<script lang="ts">
  import Accordian from "../../UI/Accordian.svelte";
  import CreateArea from "./CreateArea.svelte";
  import ListAreas from "./ListAreas.svelte";

  const sections = [
    { id: "create-area", title: "Create Area", component: CreateArea },
    // TODO: add an edit area that uses the same component as create but fills in the info
    // it should be only when a area README is open
    { id: "list-areas", title: "Areas", component: ListAreas },
  ];
</script>

<section class="space-y-2">
  <!-- Area Header -->

  <div class="flex flex-row min-w-full rounded-lg bg-teal-500 p-2">
    <!-- Area  Header + buttons (add, delete, etc [some will only be available if an area is opened]) -->
    <div class="w-1/3 grid grid-cols-2 gap-2">
      <span class="col-span-2 text-center p-2 text-2xl">Areas</span>
      <button
        type="button"
        class="clickable-icon col-span-2 mx-auto rounded-full p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <i class="i-ph-plus-bold text-4" />
      </button>
      <!-- <button -->
      <!--   type="button" -->
      <!--   class="clickable-icon rounded-full p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" -->
      <!-- > -->
      <!--   <i class="i-ph-minus-bold text-4" /> -->
      <!-- </button> -->
    </div>
    <!-- Project Priority List tags -->
    <div class="w-2/3"></div>
  </div>

  <!-- Interchangable Area -->
  <div>
    <!-- Opened project if a project README file is opened and this view is open or picked from project priority lish  -->
    <Accordian items={sections} />
    <!-- <ScrollArea {flavors} /> -->
  </div>
</section>
