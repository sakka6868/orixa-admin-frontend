import PageMeta from "../../components/common/PageMeta.tsx";
import {useState, useCallback, useEffect} from "react";
import ApiStatisticsApi from "../../api/ApiStatisticsApi.ts";
import type {ApiAccessLog, ApiOverview, ApiStatistics, Page} from "../../types/apiStatistics.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Badge, { BadgeColor } from "../../components/ui/badge/Badge.tsx";
import PaginationWithText from "../../components/ui/pagination/PaginationWithText.tsx";
import ApiAccessTrendChart from "../../components/analytics/ApiAccessTrendChart.tsx";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function ApiStatistics() {
    const [overview, setOverview] = useState<ApiOverview | null>(null);
    const [statistics, setStatistics] = useState<Page<ApiStatistics> | null>(null);
    const [accessLogs, setAccessLogs] = useState<Page<ApiAccessLog> | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'logs'>('overview');
    const [currentLogPage, setCurrentLogPage] = useState(1);
    const [currentStatPage, setCurrentStatPage] = useState(1);
    const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d');

    const message = useMessage();

    const getTimeRange = useCallback(() => {
        const now = new Date();
        let start: Date;
        switch (timeRange) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case '30d':
                start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        return {
            startTime: formatLocal(start),
            endTime: formatLocal(now)
        };
    }, [timeRange]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const { startTime, endTime } = getTimeRange();

            const [overviewData, statisticsData, logsData] = await Promise.all([
                ApiStatisticsApi.getOverview(startTime, endTime),
                ApiStatisticsApi.getStatistics({startTime, endTime, page: currentStatPage, size: 10}),
                ApiStatisticsApi.getAccessLogs({startTime, endTime, page: currentLogPage, size: 10})
            ]);

            setOverview(overviewData);
            setStatistics(statisticsData);
            setAccessLogs(logsData);
        } catch (error) {
            console.error('获取API统计数据失败:', error);
            message.error("加载失败", "获取API统计数据失败");
        } finally {
            setLoading(false);
        }
    }, [currentStatPage, currentLogPage, message, getTimeRange]);

    useMountEffect(() => {
        fetchData().then(() => console.log('API统计数据加载完成'));
    });

    useEffect(() => {
        fetchData().then(() => console.log('API统计数据加载完成'));
    }, [timeRange, fetchData]);

    const fetchLogs = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const { startTime, endTime } = getTimeRange();
            const logsData = await ApiStatisticsApi.getAccessLogs({startTime, endTime, page, size: 10});
            setAccessLogs(logsData);
            setCurrentLogPage(page);
        } catch (error) {
            console.error('获取访问日志失败:', error);
            message.error("加载失败", "获取访问日志失败");
        } finally {
            setLoading(false);
        }
    }, [message, getTimeRange]);

    const handlePageChange = (page: number) => {
        fetchLogs(page).then(() => console.log(`访问日志 - 已切换到第 ${page} 页`));
    };

    const fetchStatistics = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const { startTime, endTime } = getTimeRange();
            const statData = await ApiStatisticsApi.getStatistics({startTime, endTime, page, size: 10});
            setStatistics(statData);
            setCurrentStatPage(page);
        } catch (error) {
            console.error('获取统计趋势失败:', error);
            message.error("加载失败", "获取统计趋势失败");
        } finally {
            setLoading(false);
        }
    }, [message, getTimeRange]);

    const handleStatPageChange = (page: number) => {
        fetchStatistics(page).then(() => console.log(`统计趋势 - 已切换到第 ${page} 页`));
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toString();
    };

    const formatTime = (ms: number) => {
        if (ms >= 1000) {
            return (ms / 1000).toFixed(2) + 's';
        }
        return ms.toFixed(2) + 'ms';
    };

    // Service Distribution Donut Chart Component
    const ServiceDistributionChart = ({ overview, formatNumber }: { overview: ApiOverview; formatNumber: (n: number) => string }) => {
        const services = Object.entries(overview.requestsByService || {});
        const colors = ['#465FFF', '#FF6B6B', '#4ADE80', '#FBBF24', '#A855F7', '#EC4899'];

        const options: ApexOptions = {
            colors: colors.slice(0, services.length),
            labels: services.map(([service]) => service),
            chart: {
                fontFamily: "Outfit, sans-serif",
                type: "donut",
                height: 280,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: "65%",
                        background: "transparent",
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: "14px",
                                fontWeight: 500,
                            },
                            value: {
                                show: true,
                                formatter: (val) => formatNumber(Number(val)),
                            },
                            total: {
                                show: true,
                                label: "总计",
                                fontSize: "14px",
                                fontWeight: 500,
                                formatter: () => formatNumber(overview.totalRequests),
                            },
                        },
                    },
                },
            },
            dataLabels: { enabled: false },
            tooltip: {
                enabled: true,
                formatter: (val: number) => `${formatNumber(Number(val))} (${val.toFixed(1)}%)`,
            } as never,
            legend: {
                show: true,
                position: "bottom",
                fontFamily: "Outfit",
                fontSize: "12px",
                markers: { size: 4, shape: "circle", strokeWidth: 0 },
                itemMargin: { horizontal: 8, vertical: 4 },
            },
            responsive: [
                { breakpoint: 640, options: { chart: { height: 240 } } }
            ],
        };

        const series = services.map(([, count]) => Number(count));

        return (
            <Chart options={options} series={series} type="donut" height={280} />
        );
    };

    // Service Ranking Horizontal Bar Chart Component
    const ServiceRankingChart = ({ requestsByService, totalRequests, formatNumber }: { requestsByService: Record<string, number>; totalRequests: number; formatNumber: (n: number) => string }) => {
        const sorted = Object.entries(requestsByService || {})
            .sort(([, a], [, b]) => b - a);

        const services = sorted.map(([service]) => service);
        const counts = sorted.map(([, count]) => Number(count));

        const colors = ['#465FFF', '#FF6B6B', '#4ADE80', '#FBBF24', '#A855F7', '#EC4899'];

        const options: ApexOptions = {
            colors: colors,
            chart: {
                fontFamily: "Outfit, sans-serif",
                type: "bar",
                height: 280,
                toolbar: { show: false },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: "60%",
                    borderRadius: 4,
                },
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: services,
                labels: {
                    formatter: (val) => formatNumber(Number(val)),
                    style: { fontSize: "11px", colors: ["#6B7280"] },
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: {
                    style: { fontSize: "11px", colors: ["#6B7280"] },
                    maxWidth: 200,
                },
            },
            tooltip: {
                theme: "dark",
                y: {
                    formatter: (val) => {
                        const pct = totalRequests > 0 ? ((Number(val) / totalRequests) * 100).toFixed(1) : '0.0';
                        return `${formatNumber(Number(val))} (${pct}%)`;
                    },
                },
            },
            grid: {
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: false } },
            },
            legend: { show: false },
        };

        const series = [{ name: "请求数", data: counts }];

        if (sorted.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    暂无数据
                </div>
            );
        }

        return (
            <Chart options={options} series={series} type="bar" height={280} />
        );
    };

    // Top API Ranking Bar Chart Component
    const TopApiRankingChart = ({ data, formatNumber }: { data: ApiStatistics[]; formatNumber: (n: number) => string }) => {
        // Aggregate by API path and sort by total requests
        const apiStats = data.reduce((acc, item) => {
            const key = `${item.apiMethod} ${item.apiPath}`;
            if (!acc[key]) {
                acc[key] = { method: item.apiMethod, path: item.apiPath, total: 0, errors: 0 };
            }
            acc[key].total += item.totalRequests;
            acc[key].errors += item.errorRequests;
            return acc;
        }, {} as Record<string, { method: string; path: string; total: number; errors: number }>);

        const topApis = Object.values(apiStats)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        const colors = ['#465FFF', '#7592ff', '#4ADE80', '#FBBF24', '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#8B5CF6'];

        const options: ApexOptions = {
            colors: colors,
            chart: {
                fontFamily: "Outfit, sans-serif",
                type: "bar",
                height: 300,
                toolbar: { show: false },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: "60%",
                    borderRadius: 4,
                },
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: topApis.map(api => `${api.method} ${api.path}`),
                labels: {
                    formatter: (val) => formatNumber(Number(val)),
                    style: { fontSize: "11px", colors: ["#6B7280"] },
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: {
                    style: { fontSize: "11px", colors: ["#6B7280"] },
                    maxWidth: 200,
                },
            },
            tooltip: {
                theme: "dark",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: (_val: number, { dataPointIndex }: any) => {
                    const api = topApis[dataPointIndex];
                    return `<b>${api.method} ${api.path}</b><br/>请求数: ${formatNumber(api.total)}<br/>错误数: ${api.errors}`;
                },
            } as never,
            grid: {
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: false } },
            },
        };

        const series = [{ name: "请求数", data: topApis.map(api => api.total) }];

        if (topApis.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    暂无数据
                </div>
            );
        }

        return (
            <Chart options={options} series={series} type="bar" height={300} />
        );
    };

    // Response Time Distribution Component
    const ResponseTimeDistribution = ({ data }: { data: ApiStatistics[]; formatTime: (ms: number) => string }) => {
        // Group response times into buckets
        const buckets = [
            { label: "<100ms", min: 0, max: 100, count: 0 },
            { label: "100-300ms", min: 100, max: 300, count: 0 },
            { label: "300-500ms", min: 300, max: 500, count: 0 },
            { label: "500-1s", min: 500, max: 1000, count: 0 },
            { label: "1-3s", min: 1000, max: 3000, count: 0 },
            { label: ">3s", min: 3000, max: Infinity, count: 0 },
        ];

        data.forEach(item => {
            const idx = buckets.findIndex(b => item.avgResponseTime >= b.min && item.avgResponseTime < b.max);
            if (idx >= 0) buckets[idx].count += item.totalRequests;
        });

        const options: ApexOptions = {
            colors: ["#465FFF"],
            chart: {
                fontFamily: "Outfit, sans-serif",
                type: "bar",
                height: 250,
                toolbar: { show: false },
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: "50%",
                },
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: buckets.map(b => b.label),
                labels: { style: { fontSize: "11px", colors: ["#6B7280"] } },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: {
                    formatter: (val) => val.toLocaleString(),
                    style: { fontSize: "11px", colors: ["#6B7280"] },
                },
            },
            tooltip: {
                formatter: (val: number) => val.toLocaleString(),
            } as never,
            grid: {
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } },
            },
        };

        const series = [{ name: "请求数", data: buckets.map(b => b.count) }];

        return (
            <Chart options={options} series={series} type="bar" height={250} />
        );
    };

    const getMethodBadge = (method: string) => {
        const colors: Record<string, BadgeColor> = {
            'GET': 'success',
            'POST': 'primary',
            'PUT': 'warning',
            'DELETE': 'error',
            'PATCH': 'dark'
        };
        return <Badge color={colors[method] || 'dark'} variant="light" size="sm">{method}</Badge>;
    };

    return (
        <>
            <PageMeta
                title="API访问统计 | Orixa Admin"
                description="API访问统计分析页面"
            />

            {/* Time Range Selector */}
            <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">时间范围：</span>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {(['today', '7d', '30d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                timeRange === range
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            {range === 'today' ? '今日' : range === '7d' ? '7天' : '30天'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'overview'
                            ? 'border-b-2 border-brand-500 text-brand-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    概览
                </button>
                <button
                    onClick={() => setActiveTab('statistics')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'statistics'
                            ? 'border-b-2 border-brand-500 text-brand-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    统计趋势
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'logs'
                            ? 'border-b-2 border-brand-500 text-brand-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    访问日志
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"/>
                </div>
            ) : (
                <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && overview && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">总请求数</p>
                                        <Badge color="success" variant="light" size="sm">+12.5%</Badge>
                                    </div>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatNumber(overview.totalRequests)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">较上期 +12.5%</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">错误率</p>
                                        <Badge color="error" variant="light" size="sm">-2.1%</Badge>
                                    </div>
                                    <p className="mt-2 text-3xl font-bold text-red-600">
                                        {overview.errorRate.toFixed(2)}%
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">较上期 -2.1%</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">平均响应时间</p>
                                        <Badge color="success" variant="light" size="sm">-8.3%</Badge>
                                    </div>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(overview.avgResponseTime)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">较上期 -8.3%</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">最大响应时间</p>
                                        <Badge color="warning" variant="light" size="sm">+1.2%</Badge>
                                    </div>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(overview.maxResponseTime)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">较上期 +1.2%</p>
                                </div>
                            </div>

                            {/* Service Distribution */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Donut Chart */}
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        服务请求分布
                                    </h3>
                                    {Object.keys(overview.requestsByService || {}).length > 0 ? (
                                        <ServiceDistributionChart overview={overview} formatNumber={formatNumber} />
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                            暂无数据
                                        </div>
                                    )}
                                </div>
                                {/* Service Ranking Horizontal Bar Chart */}
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        服务排名
                                    </h3>
                                    <ServiceRankingChart
                                        requestsByService={overview.requestsByService}
                                        totalRequests={overview.totalRequests}
                                        formatNumber={formatNumber}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'statistics' && (
                        <div className="space-y-6">
                            {/* 访问趋势图表 */}
                            <ApiAccessTrendChart data={statistics?.records ?? []} />

                            {/* Top API 排名 & 响应时间分布 */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Top 10 API 排名
                                    </h3>
                                    <TopApiRankingChart data={statistics?.records ?? []} formatNumber={formatNumber} />
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        响应时间分布
                                    </h3>
                                    <ResponseTimeDistribution data={statistics?.records ?? []} formatTime={formatTime} />
                                </div>
                            </div>

                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">时间</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">服务</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">API路径</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">方法</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">请求数</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">错误数</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">平均响应</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {statistics?.records?.map((stat, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(stat.statHour).toLocaleString('zh-CN')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{stat.serviceName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{stat.apiPath}</td>
                                            <td className="px-6 py-4">{getMethodBadge(stat.apiMethod)}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">{formatNumber(stat.totalRequests)}</td>
                                            <td className="px-6 py-4 text-right text-sm text-red-600">{stat.errorRequests}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">{formatTime(stat.avgResponseTime)}</td>
                                        </tr>
                                    ))}
                                    {statistics?.records?.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                暂无统计数据
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            {statistics && statistics.totalPages > 1 && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <PaginationWithText
                                        totalPages={statistics.totalPages}
                                        initialPage={currentStatPage}
                                        onPageChange={handleStatPageChange}
                                    />
                                </div>
                            )}
                        </div>
                        </div>
                    )}

                    {/* Access Logs Tab */}
                    {activeTab === 'logs' && accessLogs && (
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">时间</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">服务</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">API路径</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">方法</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">状态</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">响应时间</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">用户</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {accessLogs.records.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(log.accessedAt).toLocaleString('zh-CN')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{log.serviceName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono truncate max-w-xs">{log.apiPath}</td>
                                            <td className="px-6 py-4">{getMethodBadge(log.apiMethod)}</td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    color={log.httpStatus < 400 ? 'success' : 'error'}
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {log.httpStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">{formatTime(log.responseTimeMs)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{log.username || '-'}</td>
                                        </tr>
                                    ))}
                                    {accessLogs.records.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                暂无访问日志
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            {/* 分页组件 */}
                            {accessLogs && accessLogs.totalPages > 1 && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <PaginationWithText
                                        totalPages={accessLogs.totalPages}
                                        initialPage={currentLogPage}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
