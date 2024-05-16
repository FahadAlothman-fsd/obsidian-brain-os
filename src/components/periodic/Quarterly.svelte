<script lang="ts">
  import { onMount } from "svelte";
  import { draw } from "svelte/transition";
  import { App, TFile } from "obsidian";
  import { pluginStore } from "../../store";

  const { plugin } = pluginStore;
  // Define quadrant names
  const quadrants = ["Q1", "Q2", "Q3", "Q4"];
  // Props for Obsidian App object and highlight colors
  let app: App = $plugin.app;
  let selectedColor: string = "#fff9ed";
  let selectedTextColor: string = "#793a15";
  let hoveredQuadrant: string | null = null;
  // export let existingNoteColor: string = "green";

  // States
  let selectedQuarter: string | null = null;
  let existingNotes = new Set<string>();

  // Check existing notes in the vault
  const loadExistingNotes = async () => {
    const files = app.vault.getMarkdownFiles();
    const existingQuarterFiles = files.filter((file: TFile) =>
      file.basename.startsWith("Quarter"),
    );

    for (const file of existingQuarterFiles) {
      const match = file.basename.match(/Quarter (\d)/);
      if (match) {
        existingNotes.add(`Q${match[1]}`);
      }
    }
  };

  // Create a new quarterly note if not already present
  const createQuarterlyNote = async (quarter: string) => {
    const fileName = `Quarter ${quarter.slice(1)}.md`;
    const fileExists = existingNotes.has(quarter);

    if (!fileExists) {
      await app.vault.create(fileName, `# Quarterly Notes: ${fileName}`);
      existingNotes.add(quarter);
    }

    selectedQuarter = quarter;
  };

  // Detect quadrant click
  const handleClick = (e: MouseEvent, quarter: string) => {
    e.stopPropagation();
    createQuarterlyNote(quarter);
  };
  // Set hover effect
  const handleMouseEnter = (e: MouseEvent) => {
    const target = e.target as SVGPathElement;
    target.setAttribute("fill", selectedColor);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    const target = e.target as SVGPathElement;
    target.setAttribute("fill", "#fef2d6");
  };

  // Calculate position for numbers in each quadrant
  const calculateNumberPosition = (index: number) => {
    const angle = (index * Math.PI) / 2 + Math.PI / 4; // Offset by 45 degrees to center
    const radius = 0.5; // Position closer to the center

    return {
      x: Math.cos(angle) * radius * 100,
      y: Math.sin(angle) * radius * 100,
    };
  };

  onMount(loadExistingNotes);
</script>

<svg width="200" height="200" viewBox="-1 -1 2 2" class="bg-green">
  {#each quadrants as quarter, index}
    <path
      tabindex={index}
      class="cursor-pointer"
      role="button"
      d="M0,0 L{Math.cos((index * Math.PI) / 2)},{Math.sin(
        (index * Math.PI) / 2,
      )} A1,1 0 0,1 {Math.cos(((index + 1) * Math.PI) / 2)},{Math.sin(
        ((index + 1) * Math.PI) / 2,
      )} Z"
      xmlns="http://www.w3.org/2000/svg"
      fill="#fef2d6"
      on:click={(e) => handleClick(e, quarter)}
      on:mouseenter={(e) => {
        handleMouseEnter(e);
        hoveredQuadrant = quarter;
      }}
      on:mouseleave={(e) => {
        handleMouseLeave(e);
        hoveredQuadrant = null;
      }}
    />
    <text
      x={calculateNumberPosition(index).x}
      y={calculateNumberPosition(index).y}
      fill={hoveredQuadrant === quarter ? selectedColor : selectedTextColor}
      class=" font-bold"
      transform="scale(0.01, 0.01)"
    >
      {index + 1}
    </text>
  {/each}
</svg>

<style>
  svg {
    cursor: pointer;
  }

  path {
    stroke: black;
    stroke-width: 0.05;
  }
</style>
