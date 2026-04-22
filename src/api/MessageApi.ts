import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';

export interface Message {
    id: string;
    title: string;
    content: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    messageType: string;
    isRead: boolean;
    isStarred: boolean;
    priority: string;
    createdAt: string;
    readAt: string;
}

export interface CreateMessageCommand {
    title: string;
    content: string;
    receiverId: string;
    priority?: string;
}

export interface UpdateMessageCommand {
    id: string;
    title?: string;
    content?: string;
    priority?: string;
    isRead?: boolean;
    isStarred?: boolean;
    messageType?: string;
}

export interface MessageQuery {
    receiverId?: string;
    senderId?: string;
    messageType?: string;
    isRead?: boolean;
    isStarred?: boolean;
    priority?: string;
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

const MessageApi = {
    createMessage: async (command: CreateMessageCommand): Promise<Message> => {
        return await requesterWithAuthenticationInstance.post(`/foundation/messages`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    updateMessage: async (command: UpdateMessageCommand): Promise<Message> => {
        return await requesterWithAuthenticationInstance.put(`/foundation/messages`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    deleteMessage: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/foundation/messages/${id}`);
    },

    listMessages: async (query: MessageQuery): Promise<Page<Message>> => {
        const response = await requesterWithAuthenticationInstance.get<PaginationResponse<Message>>(`/foundation/messages`, {
            params: query
        }) as unknown as PaginationResponse<Message>;
        const totalPages = Math.ceil(response.totalPageResultCount / response.pageSize);
        return {
            records: response.pageResult,
            total: response.totalPageResultCount,
            totalPages: totalPages,
            current: response.page,
            size: response.pageSize
        };
    },

    getUnreadCount: async (): Promise<number> => {
        return await requesterWithAuthenticationInstance.get<number>(`/foundation/messages/unread-count`) as unknown as number;
    },

    markAsRead: async (messageId: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.post(`/foundation/messages/${messageId}/read`);
    }
};

export default MessageApi;
