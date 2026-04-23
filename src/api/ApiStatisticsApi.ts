import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';
import {
    ApiAccessLog,
    ApiAccessLogQuery,
    ApiOverview,
    ApiStatistics,
    ApiStatisticsQuery,
    Page,
    PaginationResponse
} from '../types/apiStatistics.ts';

const ApiStatisticsApi = {
    getOverview: async (startTime: string, endTime: string): Promise<ApiOverview> => {
        return await requesterWithAuthenticationInstance.get(`/analysis/monitor/api/overview`, {
            params: {startTime, endTime}
        });
    },

    getStatistics: async (query: ApiStatisticsQuery): Promise<Page<ApiStatistics>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<ApiStatistics>>(
            `/analysis/monitor/api/statistics`, {params: query}
        );
        const data = response as unknown as PaginationResponse<ApiStatistics>;
        const totalPages = Math.ceil(data.totalPageResultCount / data.pageSize);
        return {
            records: data.pageResult,
            total: data.totalPageResultCount,
            totalPages: totalPages,
            current: data.page,
            size: data.pageSize
        };
    },

    getAccessLogs: async (query: ApiAccessLogQuery): Promise<Page<ApiAccessLog>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<ApiAccessLog>>(
            `/analysis/monitor/api/access-logs`, {params: query}
        );
        const data = response as unknown as PaginationResponse<ApiAccessLog>;
        const totalPages = Math.ceil(data.totalPageResultCount / data.pageSize);
        return {
            records: data.pageResult,
            total: data.totalPageResultCount,
            totalPages: totalPages,
            current: data.page,
            size: data.pageSize
        };
    }
};

export default ApiStatisticsApi;
