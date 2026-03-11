import ReactECharts from "echarts-for-react";

const chartStyle = {
  width: "100%",
  height: "160px",
};

/* =========================
   CHART COMPONENT
   ========================= */

function Chart({ series = [] }) {

  /* =========================
      DATA
     ========================= */
  const thisSeries = series.find((s) => s.id === "this_month")?.data || [];
  const lastSeries = series.find((s) => s.id === "last_month")?.data || [];


  /* =========================
     PREPARE AXIS & VALUES
     ========================= */
  const xAxisData = (thisSeries.length ? thisSeries : lastSeries).map((p) => p.x);

  const thisMonth = thisSeries.map((p) => Number(p.y) || 0);
  const lastMonth = lastSeries.map((p) => Number(p.y) || 0);


  const maxValue = Math.max(0, ...thisMonth, ...lastMonth);
  const yMax = maxValue === 0 ? 10 : Math.ceil(maxValue * 1.25);

  /* =========================
    ECHARTS CONFIG
    ========================= */
  const option = {
    backgroundColor: "transparent",
    animation: true,

    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
      containLabel: false,
    },

    tooltip: { show: false },
    legend: { show: false },

    xAxis: {
      type: "category",
      data: xAxisData,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
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
        name: "Last Month",
        type: "line",
        data: lastMonth,
        smooth: 0.55,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#AEECEF",
          cap: "round",
        },
        itemStyle: { color: "#AEECEF" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(174, 236, 239, 0.30)" },
              { offset: 1, color: "rgba(174, 236, 239, 0)" },
            ],
          },
        },
      },
      {
        name: "This Month",
        type: "line",
        data: thisMonth,
        smooth: 0.55,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#C9A3FF",
          cap: "round",
        },
        itemStyle: { color: "#C9A3FF" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(201, 163, 255, 0.26)" },
              { offset: 1, color: "rgba(201, 163, 255, 0)" },
            ],
          },
        },
      },
    ],
  };

  /* =========================
     RENDER
     ========================= */

  return <ReactECharts option={option} style={chartStyle} />;
}

export default Chart;