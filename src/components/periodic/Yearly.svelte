<script lang="ts">
  import { Grid } from "../UI";
  let size = 12;

  let grid: {
    id: string;
    title: string;
    // icon: string;
    // component: any;
  }[] = [
    {
      id: "y1",
      title: "2019",
    },
    {
      id: "y2",
      title: "2020",
    },
    {
      id: "y3",
      title: "2021",
    },
    {
      id: "y4",
      title: "2022",
    },
    {
      id: "y5",
      title: "2023",
    },
    {
      id: "y6",
      title: "2024",
    },
    {
      id: "y7",
      title: "2025",
    },
    {
      id: "y8",
      title: "2026",
    },
    {
      id: "y9",
      title: "2027",
    },
    {
      id: "y10",
      title: "2028",
    },
    {
      id: "y11",
      title: "2029",
    },
    {
      id: "y12",
      title: "2030",
    },
  ];
</script>

<Grid {size} {grid} />
