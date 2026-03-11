import ReactECharts from "echarts-for-react";

const chartStyle = {
    width: "100%",
    height: "65%"
};

function Chart({ points = [], markerIndex = 5 }) {
    /* =========================
         TRANSFORM INPUT
         ========================= */
    const xAxisData = points.map((p) => p.x);
    const values = points.map((p) => p.y);
    /* =========================
       SAFE MARKER
       ========================= */
    const safeIndex = Math.min(markerIndex, Math.max(0, values.length - 1));
    const markerValue = values[safeIndex] ?? 0;

    /* =========================
       ECHARTS OPTION
       ========================= */
    const option = {
        backgroundColor: "transparent",
        animation: true,

        grid: {
            left: 40,
            right: 18,
            top: 20,
            bottom: 28
        },

        tooltip: { show: false },
        legend: { show: false },

        xAxis: {
            type: "category",
            data: xAxisData,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "rgba(255,255,255,0.55)",
                fontSize: 11
            },
            splitLine: { show: false }
        },

        yAxis: {
            type: "value",
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "rgba(255,255,255,0.55)",
                fontSize: 11
            },
            splitLine: { show: false }
        },

        series: [
            {
                type: "line",
                data: values,
                smooth: 0.55,
                symbol: "none",

                lineStyle: {
                    width: 3,
                    color: "#AEECEF",
                    cap: "round"
                },

                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: "rgba(174,236,239,0.35)" },
                            { offset: 1, color: "rgba(174,236,239,0)" }
                        ]
                    }
                },


                markLine: {
                    silent: true,
                    symbol: "none",
                    lineStyle: {
                        type: "dotted",
                        color: "#F4C16D",
                        width: 2
                    },
                    data: [{ xAxis: safeIndex }]
                },

                markPoint: {
                    symbol: "circle",
                    symbolSize: 12,
                    itemStyle: { color: "#F4C16D" },
                    data: [{ coord: [safeIndex, markerValue] }]
                }
            }
        ]
    };
    /* =========================
       RENDER
       ========================= */
    return < ReactECharts option={option} style={chartStyle} />
}

export default Chart
