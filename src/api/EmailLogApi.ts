import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';

export interface EmailLog {
    id: string;
    toAddress: string;
    ccAddress: string;
    subject: string;
    body: string;
    senderId: string;
    senderName: string;
    emailType: string;
    status: string;
    errorMessage: string;
    sentAt: string;
    createdAt: string;
}

export interface SendEmailCommand {
    toAddress: string;
    ccAddress?: string;
    subject: string;
    body: string;
    emailType?: string;
}

export interface EmailLogQuery {
    toAddress?: string;
    emailType?: string;
    status?: string;
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

const EmailLogApi = {
    sendEmail: async (command: SendEmailCommand): Promise<EmailLog> => {
        return await requesterWithAuthenticationInstance.post(`/foundation/emails`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    listEmailLogs: async (query: EmailLogQuery): Promise<Page<EmailLog>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<EmailLog>>(`/foundation/emails`, {
            params: query
        }) as unknown as PaginationResponse<EmailLog>;
        const totalPages = Math.ceil(response.totalPageResultCount / response.pageSize);
        return {
            records: response.pageResult,
            total: response.totalPageResultCount,
            totalPages: totalPages,
            current: response.page,
            size: response.pageSize
        };
    }
};

export default EmailLogApi;
