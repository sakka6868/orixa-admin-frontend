import {useEffect, useState, useCallback} from "react";
import PageMeta from "../../components/common/PageMeta.tsx";
import PageBreadCrumb from "../../components/common/PageBreadCrumb.tsx";
import MonitorApi from "../../api/MonitorApi.ts";
import ServiceHealthCard from "../../components/monitor/ServiceHealthCard.tsx";
import ServiceMetricsCard from "../../components/monitor/ServiceMetricsCard.tsx";
import {ServiceHealthInfo, ServiceMetricsInfo, AggregatedHealthStatus} from "../../types/monitor.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import Badge from "../../components/ui/badge/Badge.tsx";

export default function MonitorDashboard() {
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState<AggregatedHealthStatus>({});
    const [metricsData, setMetricsData] = useState<ServiceMetricsInfo[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

    // 从聚合健康数据中提取服务健康信息列表
    const extractHealthInfoList = (data: AggregatedHealthStatus): ServiceHealthInfo[] => {
        const result: ServiceHealthInfo[] = [];
        // 假设返回数据结构中包含 services 或直接是服务映射
        if (data.services && typeof data.services === 'object') {
            Object.values(data.services as Record<string, ServiceHealthInfo>).forEach(service => {
                if (service && typeof service === 'object' && 'serviceName' in service) {
                    result.push(service as ServiceHealthInfo);
                }
            });
        } else {
            // 如果直接返回服务映射
            Object.entries(data).forEach(([key, value]) => {
                if (value && typeof value === 'object' && 'status' in value) {
                    result.push({
                        serviceName: key,
                        status: (value as {status: string}).status,
                        ...value as object
                    } as ServiceHealthInfo);
                }
            });
        }
        return result;
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [health, metrics] = await Promise.all([
                MonitorApi.getAggregatedHealth(),
                MonitorApi.getAllMetrics()
            ]);
            setHealthData(health);
            setMetricsData(metrics);
            setLastRefreshTime(new Date());
        } catch (error) {
            console.error('获取监控数据失败:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useMountEffect(() => {
        fetchData().then(()=>console.log('数据加载完成'));
    });

    // 自动刷新
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchData, 30000); // 30秒刷新一次
        return () => clearInterval(interval);
    }, [autoRefresh, fetchData]);

    const healthInfoList = extractHealthInfoList(healthData);

    // 计算整体状态统计
    const totalServices = healthInfoList.length;
    const healthyServices = healthInfoList.filter(s => s.status === 'UP').length;
    const unhealthyServices = totalServices - healthyServices;

    return (
        <>
            <PageMeta
                title="服务监控 | Orixa Admin"
                description="服务健康状态与性能指标监控"
            />
            <PageBreadCrumb pageTitle="服务监控" />

            <div className="space-y-6">
                {/* 顶部操作栏 */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        {/* 整体状态概览 - 使用 Badge 组件 */}
                        <div className="flex items-center gap-3">
                            <Badge color="success" variant="light">
                                正常：{healthyServices}
                            </Badge>
                            <Badge color="error" variant="light">
                                异常：{unhealthyServices}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* 最后刷新时间 */}
                        {lastRefreshTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                最后更新：{lastRefreshTime.toLocaleTimeString('zh-CN')}
                            </span>
                        )}

                        {/* 自动刷新开关 */}
                        <label className="flex cursor-pointer items-center gap-2" htmlFor="auto-refresh-toggle">
                            <span className="text-sm text-gray-600 dark:text-gray-400">自动刷新</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="auto-refresh-toggle"
                                    className="sr-only"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                                <div
                                    className={`flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                                        autoRefresh ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    aria-hidden="true"
                                >
                                    <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                                        autoRefresh ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}/>
                                </div>
                            </div>
                        </label>

                        {/* 手动刷新按钮 */}
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            aria-label="手动刷新数据"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading ? '刷新中...' : '刷新'}
                        </button>
                    </div>
                </div>

                {/* 健康状态卡片 */}
                {healthInfoList.length > 0 && (
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">服务健康状态</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {healthInfoList.map((health, index) => (
                                <ServiceHealthCard key={health.serviceName || index} healthData={health} />
                            ))}
                        </div>
                    </div>
                )}

                {/* 服务指标卡片 */}
                {metricsData.length > 0 && (
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">服务性能指标</h3>
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {metricsData.map((metrics, index) => (
                                <ServiceMetricsCard key={metrics.serviceName || index} metricsData={metrics} />
                            ))}
                        </div>
                    </div>
                )}

                {/* 空状态 */}
                {!loading && healthInfoList.length === 0 && metricsData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">暂无监控数据</p>
                    </div>
                )}

                {/* Skeleton 加载态 */}
                {loading && healthInfoList.length === 0 && (
                    <div className="space-y-6">
                        {/* 健康状态卡片骨架 */}
                        <div>
                            <div className="skeleton mb-4 h-6 w-28 rounded"></div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({length: 3}).map((_, i) => (
                                    <div key={i} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="skeleton h-5 w-32 rounded"></div>
                                            <div className="skeleton h-5 w-14 rounded-full"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="skeleton h-4 w-full rounded"></div>
                                            <div className="skeleton h-4 w-3/4 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* 性能指标骨架 */}
                        <div>
                            <div className="skeleton mb-4 h-6 w-28 rounded"></div>
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                {Array.from({length: 2}).map((_, i) => (
                                    <div key={i} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                        <div className="skeleton mb-4 h-5 w-36 rounded"></div>
                                        <div className="space-y-3">
                                            {Array.from({length: 4}).map((_, j) => (
                                                <div key={j} className="flex items-center justify-between">
                                                    <div className="skeleton h-4 w-24 rounded"></div>
                                                    <div className="skeleton h-4 w-20 rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
