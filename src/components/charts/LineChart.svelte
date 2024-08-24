<script>
  // import { chart } from "svelte-apexcharts";

  let options = {
    series: [44, 55, 41, 17, 15],
    chart: {
      type: "donut",
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 10,
      },
    },
    grid: {
      padding: {
        bottom: -80,
      },
    },
    responsive: [
      {
        breakpoint: 100,
        options: {
          chart: {
            width: 30,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
</script>

<!-- <div use:chart={dd} /> -->
