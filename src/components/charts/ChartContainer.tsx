import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface ChartContainerProps {
    chartType: "bar" | "gauge" | "line";
    chartId: string;
    title?: string;
    data?: any[];
    width?: string | number;
    height?: string | number;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
    chartType,
    chartId,
    title = "Chart",
    data = [],
    width = "100%",
    height = "250px",
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);

    //const barColors = ["#85E9D2", "#00FFB9", "#3664C6", "#97C7FF"];
    const barColors = ["#009CA0", "#00C9DD","#005C74", "#4FB1AF"];
    const lineColors = ["#009CA0", "#00C9DD","#005C74", "#4FB1AF"];
    const labelColor = "#D9D9D9";

    const getChartOption = () => {
        switch (chartType) {
            case "bar":
                return {
                    title: {
                        text: title,
                        textStyle: {
                            color: labelColor
                        }
                    },
                    tooltip: {},
                    xAxis: {
                        type: "category",
                        data: data.length > 0 ? data.map(item => item.name || item.label) : ["A", "B", "C", "D"],
                        axisLabel: {
                            color: labelColor
                        },
                        axisLine: {
                            lineStyle: {
                                color: labelColor
                            }
                        },
                        axisTick: {
                            lineStyle: {
                                color: labelColor
                            }
                        }
                    },
                    yAxis: {
                        type: "value",
                        axisLabel: {
                            color: labelColor
                        },
                        axisLine: {
                            lineStyle: {
                                color: labelColor
                            }
                        },
                        axisTick: {
                            lineStyle: {
                                color: labelColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: labelColor 
                            }
                        }
                    },
                    series: [
                        {
                            name: "Data",
                            type: "bar",
                            barWidth: '45%',
                            data: (
                                data.length > 0
                                    ? data.map((item, index) => ({
                                        value: item.value ?? 0,
                                        itemStyle: {
                                            color: barColors[index % barColors.length]
                                        }
                                    }))
                                    : [5, 20, 36, 10, 10].map((val, index) => ({
                                        value: val,
                                        itemStyle: {
                                            color: barColors[index % barColors.length]
                                        }
                                    }))
                            )
                        }
                    ]
                };

            case "gauge":
                return {
                    title: {
                        text: title,
                        textStyle: {
                            color: labelColor
                        }
                    },
                    series: [
                        {
                            type: "gauge",
                            axisLine: {
                                lineStyle: {
                                    width: 10,
                                    color: [
                                        [0.33, '#00FFB9'],
                                        [0.66, '#00C1B6'],
                                        [1, '#263c7c'],
                                    ]
                                }
                            },
                            axisLabel: {
                                color: labelColor
                            },
                            axisTick: {
                                lineStyle: {
                                    color: labelColor
                                }
                            },
                            splitLine: {
                                lineStyle: {
                                    color: labelColor
                                }
                            },
                            pointer: {
                                itemStyle: {
                                    color: labelColor
                                }
                            },
                            title: {
                                color: labelColor
                            },
                            detail: {
                                valueAnimation: true,
                                formatter: '{value}%',
                                fontSize: 14 ,
                                color: labelColor
                            },
                            data: data.length > 0 ? data : [{ value: 60, name: 'pressure' }]
                        }
                    ]
                };




            case "line":
                const categories = data.length > 0 && data[0].values
                    ? data[0].values.map((item: any) => item.name || item.label)
                    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

                return {
                    title: {
                        text: title,
                        textStyle: {
                            color: labelColor
                        }
                    },
                    color: barColors,
                    tooltip: {
                        trigger: 'axis',
                        textStyle: {
                            color: labelColor
                        }
                    },
                    legend: {
                        textStyle: {
                            color: labelColor
                        }
                    },
                    xAxis: {
                        type: "category",
                        data: categories,
                        axisLabel: {
                            color: labelColor
                        },
                        axisLine: {
                            lineStyle: {
                                color: labelColor
                            }
                        }
                    },
                    yAxis: {
                        type: "value",
                        axisLabel: {
                            color: labelColor
                        },
                        axisLine: {
                            lineStyle: {
                                color: labelColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: labelColor
                            }
                        }
                    },
                    series: data.length > 0
                        ? data.map((seriesItem: any, index: number) => ({
                            name: seriesItem.name,
                            type: "line",
                            smooth: false,
                            data: seriesItem.values.map((v: any) => v.value),
                            lineStyle: {
                                color: lineColors[index % lineColors.length]
                            },
                            itemStyle: {
                                color: lineColors[index % lineColors.length]
                            }
                        }))
                        : [
                            {
                                name: "Data",
                                type: "line",
                                smooth: false,
                                data: [10, 25, 15, 30, 45, 35]
                            }
                        ]
                };


            default:
                return {};
        }
    };

    const renderChart = () => {
        if (chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.dispose();
            }

            chartInstanceRef.current = echarts.init(chartRef.current);
            chartInstanceRef.current.setOption(getChartOption());

            const handleResize = () => {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.resize();
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.dispose();
                }
            };
        }
    };

    useEffect(() => {
        const cleanup = renderChart();
        return cleanup;
    }, [chartType, data, title]);

    return (
        <div
            ref={chartRef}
            id={chartId}
            className="xr-chart-box"
            style={{ width, height, backgroundColor: "transparent" }}
        />
    );
};

export default ChartContainer;