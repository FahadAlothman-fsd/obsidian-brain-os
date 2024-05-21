<script lang="ts">
  import { Grid } from "../UI";
  let size = 4;

  let grid: {
    id: string;
    title: string;
    // icon: string;
    // component: any;
  }[] = [
    {
      id: "q1",
      title: "Q1",
    },
    {
      id: "q2",
      title: "Q2",
    },
    {
      id: "q3",
      title: "Q3",
    },
    {
      id: "q4",
      title: "Q4",
    },
  ];
  size = 4;
</script>

<Grid {size} {grid} />
