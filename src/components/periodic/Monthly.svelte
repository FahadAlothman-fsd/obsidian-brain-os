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
      id: "m1",
      title: "1",
    },
    {
      id: "m2",
      title: "2",
    },
    {
      id: "m3",
      title: "3",
    },
    {
      id: "m4",
      title: "4",
    },
    {
      id: "m5",
      title: "5",
    },
    {
      id: "m6",
      title: "6",
    },
    {
      id: "m7",
      title: "7",
    },
    {
      id: "m8",
      title: "8",
    },
    {
      id: "m9",
      title: "9",
    },
    {
      id: "m10",
      title: "10",
    },
    {
      id: "m11",
      title: "11",
    },
    {
      id: "m12",
      title: "12",
    },
  ];
</script>

<Grid {size} {grid} />
