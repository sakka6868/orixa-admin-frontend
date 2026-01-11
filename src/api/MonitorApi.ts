import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';
import {ServiceHealthInfo, ServiceMetricsInfo, AggregatedHealthStatus} from "../types/monitor.ts";

const MonitorApi = {
    /**
     * 获取所有服务的聚合健康状态
     */
    getAggregatedHealth: async (): Promise<AggregatedHealthStatus> => {
        return await requesterWithAuthenticationInstance.get('/analysis/monitor/health');
    },

    /**
     * 获取单个服务的健康状态
     * @param serviceName 服务名称
     */
    getServiceHealth: async (serviceName: string): Promise<ServiceHealthInfo> => {
        return await requesterWithAuthenticationInstance.get(`/analysis/monitor/health/${serviceName}`);
    },

    /**
     * 获取所有服务的指标
     */
    getAllMetrics: async (): Promise<ServiceMetricsInfo[]> => {
        return await requesterWithAuthenticationInstance.get('/analysis/monitor/metrics');
    },

    /**
     * 获取单个服务的指标
     * @param serviceName 服务名称
     */
    getServiceMetrics: async (serviceName: string): Promise<ServiceMetricsInfo> => {
        return await requesterWithAuthenticationInstance.get(`/analysis/monitor/metrics/${serviceName}`);
    }
};

export default MonitorApi;
