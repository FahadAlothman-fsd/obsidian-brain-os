<script lang="ts">
  import { Grid } from "../UI";
  let cols = 3;

  let grid: {
    id: string;
    title: string;
    active: boolean;
    // icon: string;
    // component: any;
  }[] = [
    {
      id: "y1",
      title: "2019",
      active: true,
    },
    {
      id: "y2",
      title: "2020",
      active: false,
    },
    {
      id: "y3",
      title: "2021",
      active: true,
    },
    {
      id: "y4",
      title: "2022",
      active: false,
    },
    {
      id: "y5",
      title: "2023",
      active: true,
    },
    {
      id: "y6",
      title: "2024",
      active: false,
    },
    {
      id: "y7",
      title: "2025",
      active: true,
    },
    {
      id: "y8",
      title: "2026",
      active: false,
    },
    {
      id: "y9",
      title: "2027",
      active: true,
    },
    {
      id: "y10",
      title: "2028",
      active: false,
    },
    {
      id: "y11",
      title: "2029",
      active: true,
    },
    {
      id: "y12",
      title: "2030",
      active: false,
    },
  ];
</script>

<Grid textSize={"text-sm"} {cols} {grid} />
