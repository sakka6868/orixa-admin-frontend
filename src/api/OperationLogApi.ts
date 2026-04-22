import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';

export interface OperationLog {
    id: string;
    userId: string;
    username: string;
    module: string;
    operationType: string;
    targetType: string;
    targetId: string;
    targetName: string;
    detail: string;
    ipAddress: string;
    userAgent: string;
    status: string;
    errorMessage: string;
    createdAt: string;
}

export interface OperationLogQuery {
    module?: string;
    operationType?: string;
    targetType?: string;
    targetId?: string;
    username?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    size?: number;
}

// 后端 Pagination<T> 的响应格式适配
export interface PaginationResponse<T> {
    pageResult: T[];
    page: number;
    pageSize: number;
    totalPageResultCount: number;
}

export interface Page<T> {
    records: T[];
    total: number;
    totalPages: number;
    current: number;
    size: number;
}

const OperationLogApi = {
    listOperationLogs: async (query: OperationLogQuery): Promise<Page<OperationLog>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<OperationLog>>(`/system/operation-logs`, {
            params: query
        }) as unknown as PaginationResponse<OperationLog>;
        const totalPages = Math.ceil(response.totalPageResultCount / response.pageSize);
        return {
            records: response.pageResult,
            total: response.totalPageResultCount,
            totalPages: totalPages,
            current: response.page,
            size: response.pageSize
        };
    },

    recordOperation: async (command: {
        module: string;
        operationType: string;
        targetType?: string;
        targetId?: string;
        targetName?: string;
        detail?: string;
        status: string;
        errorMessage?: string;
    }): Promise<void> => {
        await requesterWithAuthenticationInstance.post(`/system/operation-logs`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};

export default OperationLogApi;
