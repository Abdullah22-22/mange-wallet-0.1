import  { useMemo } from "react";
import ReactECharts from "echarts-for-react";

function Chart({ value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  const option = useMemo(() => ({
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: "100%",
        center: ["50%", "70%"],
        progress: {
          show: true,
          width: 26,
        },
        pointer: {
          show: true,
          length: "62%",
          width: 5,
        },
        axisLine: {
          lineStyle: {
            width: 26,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        anchor: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          fontSize: 18,
          color: "#ffffff",
          offsetCenter: [0, "20%"],
          formatter: "{value}%",
        },
        data: [
          {
            value: safeValue,
          },
        ],
      },
    ],
  }), [safeValue]);

  return (
    <div className="savings-chart">
      <ReactECharts option={option} style={{ height: "180px", width: "100%" }} />
    </div>
  );
}

export default Chart;