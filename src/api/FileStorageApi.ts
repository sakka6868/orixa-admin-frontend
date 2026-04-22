import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';

export interface FileStorage {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    storageType: string;
    storageBucket: string;
    fileHash: string;
    uploaderId: string;
    uploaderName: string;
    isPublic: boolean;
    isTemp: boolean;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    formattedSize?: string;
}

export interface FileStorageQuery {
    uploaderId?: string;
    fileName?: string;
    mimeType?: string;
    storageType?: string;
    isTemp?: boolean;
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

const FileStorageApi = {
    uploadFile: async (file: File): Promise<FileStorage> => {
        const formData = new FormData();
        formData.append('file', file);
        return await requesterWithAuthenticationInstance.post(`/foundation/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    listFiles: async (query: FileStorageQuery): Promise<Page<FileStorage>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<FileStorage>>(`/foundation/files`, {
            params: query
        }) as unknown as PaginationResponse<FileStorage>;
        const totalPages = Math.ceil(response.totalPageResultCount / response.pageSize);
        return {
            records: response.pageResult,
            total: response.totalPageResultCount,
            totalPages: totalPages,
            current: response.page,
            size: response.pageSize
        };
    },

    getFileById: async (id: string): Promise<FileStorage> => {
        return await requesterWithAuthenticationInstance.get(`/foundation/files/${id}`);
    },

    deleteFile: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/foundation/files/${id}`);
    }
};

export default FileStorageApi;
