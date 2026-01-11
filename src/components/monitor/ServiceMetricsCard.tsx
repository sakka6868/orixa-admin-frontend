import {ServiceMetricsInfo} from "../../types/monitor.ts";

interface ServiceMetricsCardProps {
    metricsData: ServiceMetricsInfo;
}

/**
 * 格式化字节大小
 */
const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化运行时长（输入单位：秒）
 */
const formatUptime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}天 ${hours % 24}小时`;
    }
    if (hours > 0) {
        return `${hours}小时 ${minutes % 60}分钟`;
    }
    if (minutes > 0) {
        return `${minutes}分钟`;
    }
    return `${Math.floor(seconds)}秒`;
};

/**
 * 服务指标卡片组件
 */
export default function ServiceMetricsCard({metricsData}: ServiceMetricsCardProps) {
    const {jvm, http} = metricsData;
    
    // 计算堆内存使用百分比
    const heapUsagePercent = jvm?.heapMax > 0 ? ((jvm.heapUsed ?? 0) / jvm.heapMax * 100).toFixed(1) : '0';
    // CPU使用率百分比
    const cpuPercent = ((jvm?.cpuUsage ?? 0) * 100).toFixed(1);
    // 错误率
    const errorRate = http?.totalRequests > 0 ? ((http.errorCount ?? 0) / http.totalRequests * 100).toFixed(2) : '0';

    const formatTime = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString('zh-CN');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            {/* 头部信息 */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                        {metricsData.serviceName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        采集时间: {formatTime(metricsData.collectTime)}
                    </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    运行 {formatUptime(jvm.uptime)}
                </span>
            </div>

            {/* JVM 指标 */}
            <div className="mb-5">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">JVM 指标</h5>
                <div className="grid grid-cols-2 gap-4">
                    {/* 堆内存 */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">堆内存</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{heapUsagePercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all ${
                                    Number(heapUsagePercent) > 80 ? 'bg-error-500' : 
                                    Number(heapUsagePercent) > 60 ? 'bg-warning-500' : 'bg-success-500'
                                }`}
                                style={{width: `${heapUsagePercent}%`}}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {formatBytes(jvm.heapUsed)} / {formatBytes(jvm.heapMax)}
                        </p>
                    </div>

                    {/* CPU 使用率 */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">CPU 使用率</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cpuPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all ${
                                    Number(cpuPercent) > 80 ? 'bg-error-500' : 
                                    Number(cpuPercent) > 60 ? 'bg-warning-500' : 'bg-brand-500'
                                }`}
                                style={{width: `${cpuPercent}%`}}
                            />
                        </div>
                    </div>

                    {/* 线程数 */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <span className="text-xs text-gray-500 dark:text-gray-400">线程数</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-lg font-semibold text-gray-800 dark:text-white">{jvm.threadCount}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">/ 峰值 {jvm.threadPeak}</span>
                        </div>
                    </div>

                    {/* GC 信息 */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <span className="text-xs text-gray-500 dark:text-gray-400">GC</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-lg font-semibold text-gray-800 dark:text-white">{jvm.gcCount}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">次 / {jvm.gcTime}ms</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* HTTP 指标 */}
            <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">HTTP 指标</h5>
                <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                            {(http?.totalRequests ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">总请求数</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                            {(http?.requestsPerSecond ?? 0).toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">QPS</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                            {(http?.avgResponseTime ?? 0).toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">平均响应(ms)</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <p className={`text-lg font-semibold ${
                            Number(errorRate) > 1 ? 'text-error-600 dark:text-error-400' : 'text-gray-800 dark:text-white'
                        }`}>
                            {errorRate}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">错误率</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
