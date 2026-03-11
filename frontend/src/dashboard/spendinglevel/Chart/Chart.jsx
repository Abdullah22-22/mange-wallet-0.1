import ReactECharts from "echarts-for-react";

/* =========================
   CHART STYLE
   ========================= */
const chartStyle = {
  width: "100%",
  height: "125%",
};

function Chart({ points = [], yMax = 2500 }) {

  /* =========================
     AXIS DATA
     ========================= */
  const xAxisData = points.map((p) => p.x);
  const values = points.map((p) => p.y)

  /* =========================
     ECHARTS CONFIG
     ========================= */
  const option = {
    backgroundColor: "transparent",
    animation: true,

    grid: {
      left: 10,
      righ: 10,
      top: 10,
      bottom: 10,
      containLabel: false,
    },

    tooltip: { show: false },

    xAxis: {
      type: "category",
      data: xAxisData,
      axisLine: { show: false },
      axisTick: { showe: false },
      axisLabel: { show: true },
      splitLine: { show: false },
    },

    yAxis: {
      type: "value",
      min: 0,
      max: yMax,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },

    series: [
      {
        type: "bar",
        data: values,
        barWidth: 10,
        itemStyle: {
          borderRadius: [8, 8, 8, 8],
        },
      },
    ],
  };

  /* =========================
     RENDER
     ========================= */

  return <ReactECharts option={option} style={chartStyle} />
}

export default Chart
