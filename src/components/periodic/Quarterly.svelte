<script lang="ts">
  import { Grid } from "../UI";
  let cols = 2;

  let grid: {
    id: string;
    title: string;
    active: boolean;
    // icon: string;
    // component: any;
  }[] = [
    {
      id: "q1",
      title: "Q1",
      active: true,
    },
    {
      id: "q2",
      title: "Q2",
      active: true,
    },
    {
      id: "q3",
      title: "Q3",
      active: true,
    },
    {
      id: "q4",
      title: "Q4",
    },
  ];
</script>

<Grid {cols} {grid} />
