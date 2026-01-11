import {ServiceHealthInfo} from "../../types/monitor.ts";

interface ServiceHealthCardProps {
    healthData: ServiceHealthInfo;
}

/**
 * 服务健康状态卡片组件
 */
export default function ServiceHealthCard({healthData}: ServiceHealthCardProps) {
    const isHealthy = healthData.status === 'UP';
    const statusColor = isHealthy ? 'success' : 'error';

    const formatTime = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString('zh-CN');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isHealthy ? 'bg-success-100 dark:bg-success-500/20' : 'bg-error-100 dark:bg-error-500/20'
                    }`}>
                        {isHealthy ? (
                            <svg className="w-5 h-5 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                            {healthData.serviceName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {healthData.serviceUrl}
                        </p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    statusColor === 'success' 
                        ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400' 
                        : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400'
                }`}>
                    {healthData.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">响应时间</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {healthData.responseTimeMs} ms
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">检查时间</p>
                    <p className="text-xs font-medium text-gray-800 dark:text-white">
                        {formatTime(healthData.checkTime)}
                    </p>
                </div>
            </div>
        </div>
    );
}
