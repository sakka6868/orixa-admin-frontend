import PageMeta from "../../components/common/PageMeta.tsx";
import {useState, useCallback} from "react";
import ApiStatisticsApi from "../../api/ApiStatisticsApi.ts";
import type {ApiAccessLog, ApiOverview, ApiStatistics, Page} from "../../types/apiStatistics.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Badge, { BadgeColor } from "../../components/ui/badge/Badge.tsx";
import PaginationWithText from "../../components/ui/pagination/PaginationWithText.tsx";
import ApiAccessTrendChart from "../../components/analytics/ApiAccessTrendChart.tsx";

export default function ApiStatistics() {
    const [overview, setOverview] = useState<ApiOverview | null>(null);
    const [statistics, setStatistics] = useState<Page<ApiStatistics> | null>(null);
    const [accessLogs, setAccessLogs] = useState<Page<ApiAccessLog> | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'logs'>('overview');
    const [currentLogPage, setCurrentLogPage] = useState(1);
    const [currentStatPage, setCurrentStatPage] = useState(1);

    const message = useMessage();

    useMountEffect(() => {
        fetchData().then(() => console.log('API统计数据加载完成'));
    });

    const getTimeRange = () => {
        const now = new Date();
        const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        return {
            startTime: formatLocal(start),
            endTime: formatLocal(now)
        };
    };

    const fetchData = async () => {
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
    };

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
    }, [message]);

    const handlePageChange = (page: number) => {
        fetchLogs(page);
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
    }, [message]);

    const handleStatPageChange = (page: number) => {
        fetchStatistics(page);
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

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'overview'
                            ? 'border-b-2 border-primary-500 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    概览
                </button>
                <button
                    onClick={() => setActiveTab('statistics')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'statistics'
                            ? 'border-b-2 border-primary-500 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    统计趋势
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'logs'
                            ? 'border-b-2 border-primary-500 text-primary-600'
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400">总请求数</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatNumber(overview.totalRequests)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">错误率</p>
                                    <p className="mt-2 text-3xl font-bold text-red-600">
                                        {overview.errorRate.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">平均响应时间</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(overview.avgResponseTime)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">最大响应时间</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(overview.maxResponseTime)}
                                    </p>
                                </div>
                            </div>

                            {/* Service Distribution */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    各服务请求分布
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(overview.requestsByService || {}).map(([service, count]) => (
                                        <div key={service} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-500"
                                                        style={{width: `${overview.totalRequests > 0 ? (Number(count) / Number(overview.totalRequests)) * 100 : 0}%`}}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                                                    {formatNumber(Number(count))}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'statistics' && (
                        <div className="space-y-6">
                            {/* 访问趋势图表 */}
                            <ApiAccessTrendChart data={statistics?.records ?? []} />

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
