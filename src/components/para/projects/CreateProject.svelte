<script lang="ts">
  import ComboBox from "../../UI/ComboBox.svelte";
  import Input from "../../UI/Input.svelte";
  import TagInput from "../../UI/TagInput.svelte";

  let projectTag: string = "";
  let projectFolder: string;
  let projectIndex: string;

  $: if (projectTag.length > 0) {
    projectFolder = projectTag.substring(projectTag.lastIndexOf("/") + 1);
    projectIndex =
      projectTag.substring(projectTag.lastIndexOf("/") + 1) + ".README.md";
  }

  const handleCreateProject = () => {};
</script>

<div class="flex flex-col gap-3 p-2">
  <ComboBox
    bind:value={projectTag}
    title={"Tag"}
    placeholder={"#area/sub-area/project..."}
  />
  <Input
    title={"Folder"}
    placeholder={"project..."}
    bind:value={projectFolder}
  />
  <Input
    title={"Entry"}
    placeholder={"project.README.md..."}
    bind:value={projectIndex}
  />
  <hr />
  <TagInput />
  <button
    type="button"
    on:click={handleCreateProject}
    class="clickable-icon inline-flex items-center gap-x-2 rounded-md bg-indigo-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    <svg
      class="-ml-0.5 h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clip-rule="evenodd"
      />
    </svg>
    Create Project
  </button>
</div>
