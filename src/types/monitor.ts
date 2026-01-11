/**
 * 服务健康状态信息
 */
export interface ServiceHealthInfo {
    serviceName: string;      // 服务名称
    serviceUrl: string;       // 服务URL
    status: string;           // 健康状态 (UP/DOWN等)
    checkTime: string;        // 检查时间
    responseTimeMs: number;   // 响应时间(毫秒)
    details: Record<string, unknown>;  // 详细信息
}

/**
 * JVM 指标信息
 */
export interface JvmMetrics {
    heapUsed: number;         // 堆内存使用量(bytes)
    heapMax: number;          // 堆内存最大值(bytes)
    nonHeapUsed: number;      // 非堆内存使用量(bytes)
    threadCount: number;      // 当前线程数
    threadPeak: number;       // 峰值线程数
    gcCount: number;          // GC次数
    gcTime: number;           // GC耗时(ms)
    cpuUsage: number;         // CPU使用率
    uptime: number;           // 运行时长(ms)
}

/**
 * HTTP 指标信息
 */
export interface HttpMetrics {
    totalRequests: number;     // 总请求数
    requestsPerSecond: number; // 每秒请求数
    avgResponseTime: number;   // 平均响应时间(ms)
    errorCount: number;        // 错误请求数
}

/**
 * 服务指标信息
 */
export interface ServiceMetricsInfo {
    serviceName: string;                    // 服务名称
    serviceUrl: string;                     // 服务URL
    collectTime: string;                    // 采集时间
    jvm: JvmMetrics;                        // JVM 指标
    http: HttpMetrics;                      // HTTP 指标
    customMetrics: Record<string, unknown>; // 自定义指标
}

/**
 * 聚合健康状态返回类型
 */
export type AggregatedHealthStatus = Record<string, unknown>;
