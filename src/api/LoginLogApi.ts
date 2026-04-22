import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';

export interface LoginLog {
    id: string;
    userId: string;
    username: string;
    loginType: string;
    ipAddress: string;
    userAgent: string;
    loginStatus: string;
    failureReason: string;
    loginTime: string;
}

export interface LoginLogQuery {
    username?: string;
    loginType?: string;
    loginStatus?: string;
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

const LoginLogApi = {
    listLoginLogs: async (query: LoginLogQuery): Promise<Page<LoginLog>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<LoginLog>>(`/system/login-logs`, {
            params: query
        }) as unknown as PaginationResponse<LoginLog>;
        return {
            records: response.pageResult,
            total: response.totalPageResultCount,
            totalPages: Math.ceil(response.totalPageResultCount / response.pageSize),
            current: response.page,
            size: response.pageSize
        };
    }
};

export default LoginLogApi;
