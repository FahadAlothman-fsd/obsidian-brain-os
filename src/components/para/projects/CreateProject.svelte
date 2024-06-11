<!-- <section> -->
<!--   <input type="text" bind:value={$name.value} /> -->
<!--   {#if $myForm.hasError("name.required")} -->
<!--     <div>Name is required</div> -->
<!--   {/if} -->
<!---->
<!--   <button disabled={!$myForm.valid}>Send form</button> -->
<!-- </section> -->
<script lang="ts">
  import { get } from "svelte/store";
  import { form, field } from "svelte-forms";
  import { required } from "svelte-forms/validators";
  import { tagsStore } from "../../../stores";
  import { tagExists } from "../../../utils";
  import ComboBox from "../../UI/ComboBox.svelte";
  import Input from "../../UI/Input.svelte";
  import TagInput from "../../UI/TagInput.svelte";

  const projectTag = field("project_tag", "", [required()], {
    validateOnChange: true,
  });
  const projectFolder = field("project_folder", "", [required()], {
    validateOnChange: true,
  });
  const projectIndex = field("project_index", "", [required()], {
    validateOnChange: true,
  });
  const createProjectForm = form(projectTag, projectFolder, projectIndex);

  projectTag.subscribe((prjTag) => {
    if (prjTag.value.length > 0) {
      const projectName = prjTag.value.substring(
        prjTag.value.lastIndexOf("/") + 1,
      );
      if (projectName === "") {
        projectFolder.set("");
        projectIndex.set("");
      } else if (!tagExists($tagsStore, prjTag.value)) {
        projectFolder.set(projectName);
        projectIndex.set(`${projectName}.README.md`);
      }
    }
  });

  const handleShouldOpen = (inputValue: string, selected: string) => {
    const prjTag = get(projectTag);
    let open = true;

    const tag = inputValue.split("/");
    tag.forEach((value, index) => {
      if (tag.slice(0, index).join("") === selected) {
        open = true;
        return;
      }
    });
    if (inputValue.length < selected.length) {
      return true;
    }

    return (
      prjTag.value.substring(prjTag.value.lastIndexOf("/") + 1) === selected
    );
  };

  // const handleCreateProject = () => {};
</script>

<div class="flex flex-col gap-3 p-2">
  <ComboBox
    inputField={projectTag}
    title={"Tag"}
    placeholder={"#area/sub-area/project..."}
    error={$createProjectForm.hasError("projectTag.required")}
    shouldOpen={handleShouldOpen}
  />
  <Input
    title={"Folder"}
    placeholder={"project..."}
    inputField={projectFolder}
    error={$createProjectForm.hasError("projectFolder.required")}
  />
  <Input
    title={"Entry"}
    placeholder={"project.README.md..."}
    inputField={projectIndex}
    error={$createProjectForm.hasError("projectIndex.required")}
  />
  <hr />
  <TagInput />
  <button
    type="button"
    disabled={!$createProjectForm.valid}
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
