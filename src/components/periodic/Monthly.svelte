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
      id: "m1",
      title: "Jan",
      active: true,
    },
    {
      id: "m2",
      title: "Feb",
      active: false,
    },
    {
      id: "m3",
      title: "Mar",
      active: true,
    },
    {
      id: "m4",
      title: "Apr",
      active: false,
    },
    {
      id: "m5",
      title: "May",
      active: true,
    },
    {
      id: "m6",
      title: "Jun",
      active: false,
    },
    {
      id: "m7",
      title: "Jul",
      active: true,
    },
    {
      id: "m8",
      title: "Aug",
      active: false,
    },
    {
      id: "m9",
      title: "Sep",
      active: true,
    },
    {
      id: "m10",
      title: "Oct",
      active: false,
    },
    {
      id: "m11",
      title: "Nov",
      active: true,
    },
    {
      id: "m12",
      title: "Dec",
      active: false,
    },
  ];
</script>

<Grid textSize="text-sm" {cols} {grid} />
