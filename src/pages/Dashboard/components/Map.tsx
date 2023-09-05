import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";

const labels = ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"];

const options: Highcharts.Options = {
  chart: {
    renderTo: "container",
  },
  title: {
    text: "Storage Analysis",
  },
  credits: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
  plotOptions: {
    series: {
      pointPlacement: "on",
    },
  },
  xAxis: {
    categories: labels,
    accessibility: {
      description: "Months of the year",
    },
    tickmarkPlacement: "on",
  },
  yAxis: {
    title: {
      text: "Storage Usage (GB)",
    },
    labels: {
      format: "{value}GB",
    },
  },
  tooltip: {
    formatter: function (tooltip) {
      console.log(tooltip);
      console.log(this);
      return "The value for <b>" + this.x + "</b> is <b>" + this.y + "</b>";
    },
  },
  series: [
    {
      name: "Storage Usage",
      type: "area",
      data: [1, 5, 20, 4, 6, 2, 75],
      custom: [1, 5, 20, 4, 6, 2, 75],
      lineColor: "#03BC47",
      color: "#03BC4740",
      threshold: null,
    },
  ],
};

export default function Map() {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
    />
  );
}
