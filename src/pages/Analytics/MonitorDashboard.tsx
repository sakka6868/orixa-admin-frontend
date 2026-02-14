import {useEffect, useState, useCallback} from "react";
import PageMeta from "../../components/common/PageMeta.tsx";
import PageBreadCrumb from "../../components/common/PageBreadCrumb.tsx";
import MonitorApi from "../../api/MonitorApi.ts";
import ServiceHealthCard from "../../components/monitor/ServiceHealthCard.tsx";
import ServiceMetricsCard from "../../components/monitor/ServiceMetricsCard.tsx";
import {ServiceHealthInfo, ServiceMetricsInfo, AggregatedHealthStatus} from "../../types/monitor.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";

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
                title="服务监控 | OrixaAdmin - React.js 管理仪表盘"
                description="服务健康状态与性能指标监控"
            />
            <PageBreadCrumb pageTitle="服务监控" />

            <div className="space-y-6">
                {/* 顶部操作栏 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* 整体状态概览 */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-success-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    正常: <span className="font-semibold text-gray-800 dark:text-white">{healthyServices}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-error-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    异常: <span className="font-semibold text-gray-800 dark:text-white">{unhealthyServices}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* 最后刷新时间 */}
                        {lastRefreshTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                最后更新: {lastRefreshTime.toLocaleTimeString('zh-CN')}
                            </span>
                        )}

                        {/* 自动刷新开关 */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-sm text-gray-600 dark:text-gray-400">自动刷新</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                                <div className={`w-10 h-5 rounded-full transition-colors flex items-center ${
                                    autoRefresh ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                                        autoRefresh ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}/>
                                </div>
                            </div>
                        </label>

                        {/* 手动刷新按钮 */}
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading ? '刷新中...' : '刷新'}
                        </button>
                    </div>
                </div>

                {/* 健康状态卡片 */}
                {healthInfoList.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">服务健康状态</h3>
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
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">服务性能指标</h3>
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
                        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">暂无监控数据</p>
                    </div>
                )}

                {/* 加载状态 */}
                {loading && healthInfoList.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                        <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">加载中...</span>
                    </div>
                )}
            </div>
        </>
    );
}
