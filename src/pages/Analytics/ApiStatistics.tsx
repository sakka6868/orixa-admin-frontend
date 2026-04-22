import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import ApiStatisticsApi from "../../api/ApiStatisticsApi.ts";
import type {ApiAccessLog, ApiOverview, ApiStatistics, Page} from "../../types/apiStatistics.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Badge, { BadgeColor } from "../../components/ui/badge/Badge.tsx";

export default function ApiStatistics() {
    const [overview, setOverview] = useState<ApiOverview | null>(null);
    const [statistics, setStatistics] = useState<ApiStatistics[]>([]);
    const [accessLogs, setAccessLogs] = useState<Page<ApiAccessLog> | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'logs'>('overview');

    const message = useMessage();

    useMountEffect(() => {
        fetchData().then(() => console.log('API统计数据加载完成'));
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const endTime = new Date().toISOString();
            const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const [overviewData, statisticsData, logsData] = await Promise.all([
                ApiStatisticsApi.getOverview(startTime, endTime),
                ApiStatisticsApi.getStatistics({startTime, endTime}),
                ApiStatisticsApi.getAccessLogs({startTime, endTime, size: 10})
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
        return ms + 'ms';
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
                                                        style={{width: `${(Number(count) / Number(overview.totalRequests)) * 100}%`}}
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
                                    {statistics.map((stat, idx) => (
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
                                    {statistics.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                暂无统计数据
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
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
                        </div>
                    )}
                </>
            )}
        </>
    );
}
