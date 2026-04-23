import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { ApiStatistics } from "../../types/apiStatistics";

interface ApiAccessTrendChartProps {
    data: ApiStatistics[];
}

export default function ApiAccessTrendChart({ data }: ApiAccessTrendChartProps) {
    // 按时间聚合数据
    const aggregatedData = data.reduce((acc, item) => {
        const date = new Date(item.statHour).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        if (!acc[date]) {
            acc[date] = { requests: 0, errors: 0 };
        }
        acc[date].requests += item.totalRequests;
        acc[date].errors += item.errorRequests;
        return acc;
    }, {} as Record<string, { requests: number; errors: number }>);

    const categories = Object.keys(aggregatedData);
    const requestData = categories.map(date => aggregatedData[date].requests);
    const errorData = categories.map(date => aggregatedData[date].errors);

    const options: ApexOptions = {
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "right",
        },
        colors: ["#465FFF", "#FF6B6B"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            height: 300,
            type: "area",
            toolbar: {
                show: false,
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.55,
                opacityTo: 0.05,
            },
        },
        stroke: {
            curve: "smooth",
            width: 2,
        },
        markers: {
            size: 0,
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
        grid: {
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            x: {
                format: "dd MMM yyyy HH:mm",
            },
        },
        xaxis: {
            type: "category",
            categories: categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    fontSize: "12px",
                    colors: ["#6B7280"],
                },
                rotate: -45,
                rotateAlways: false,
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: "12px",
                    colors: ["#6B7280"],
                },
                formatter: (value) => value.toLocaleString(),
            },
        },
    };

    const series = [
        {
            name: "请求数",
            data: requestData,
        },
        {
            name: "错误数",
            data: errorData,
        },
    ];

    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    API 访问趋势
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    暂无数据
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API 访问趋势
            </h3>
            <div className="overflow-x-auto">
                <Chart options={options} series={series} type="area" height={300} />
            </div>
        </div>
    );
}
