export interface ApiAccessLog {
    id: string;
    apiPath: string;
    apiMethod: string;
    serviceName: string;
    userId: string;
    username: string;
    responseTimeMs: number;
    httpStatus: number;
    ipAddress: string;
    accessedAt: string;
}

export interface ApiStatistics {
    serviceName: string;
    apiPath: string;
    apiMethod: string;
    statHour: string;
    totalRequests: number;
    errorRequests: number;
    avgResponseTime: number;
    maxResponseTime: number;
    uniqueUsers: number;
}

export interface ApiOverview {
    totalRequests: number;
    errorRequests: number;
    errorRate: number;
    avgResponseTime: number;
    maxResponseTime: number;
    requestsByService: Record<string, number>;
    requestsByPath: Record<string, number>;
    startTime: string;
    endTime: string;
}

export interface ApiAccessLogQuery {
    serviceName?: string;
    apiPath?: string;
    apiMethod?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    size?: number;
}

export interface ApiStatisticsQuery {
    serviceName?: string;
    apiPath?: string;
    startTime?: string;
    endTime?: string;
}

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
