import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';

export interface SystemConfig {
    id: string;
    configKey: string;
    configValue: string;
    configType: string;
    category: string;
    description: string;
    isEncrypted: boolean;
    isReadonly: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSystemConfigCommand {
    configKey: string;
    configValue: string;
    configType?: string;
    category?: string;
    description?: string;
    isEncrypted?: boolean;
    isReadonly?: boolean;
}

export interface UpdateSystemConfigCommand {
    id: string;
    configValue: string;
    description?: string;
}

export interface SystemConfigQuery {
    category?: string;
    configType?: string;
    configKey?: string;
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

const SystemConfigApi = {
    createSystemConfig: async (command: CreateSystemConfigCommand): Promise<SystemConfig> => {
        return await requesterWithAuthenticationInstance.post(`/system/system-configs`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    updateSystemConfig: async (command: UpdateSystemConfigCommand): Promise<SystemConfig> => {
        return await requesterWithAuthenticationInstance.put(`/system/system-configs`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    deleteSystemConfig: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/system/system-configs/${id}`);
    },

    listSystemConfigs: async (query: SystemConfigQuery): Promise<Page<SystemConfig>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<SystemConfig>>(`/system/system-configs`, {
            params: query
        }) as unknown as PaginationResponse<SystemConfig>;
        const totalPages = Math.ceil(response.totalPageResultCount / response.pageSize);
        return {
            records: response.pageResult,
            total: response.totalPageResultCount,
            totalPages: totalPages,
            current: response.page,
            size: response.pageSize
        };
    },

    getSystemConfigByKey: async (configKey: string): Promise<SystemConfig> => {
        return await requesterWithAuthenticationInstance.get(`/system/system-configs/key/${configKey}`);
    }
};

export default SystemConfigApi;
