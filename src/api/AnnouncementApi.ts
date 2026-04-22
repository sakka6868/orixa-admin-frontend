import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';
import {Announcement, AnnouncementFormData, AnnouncementQuery} from '../types/announcement.ts';

const AnnouncementApi = {
    createAnnouncement: async (data: AnnouncementFormData): Promise<Announcement> => {
        return await requesterWithAuthenticationInstance.post(`/system/announcements`, data, {
            headers: {'Content-Type': 'application/json'}
        });
    },

    updateAnnouncement: async (id: string, data: AnnouncementFormData): Promise<Announcement> => {
        return await requesterWithAuthenticationInstance.put(`/system/announcements`, {id, ...data}, {
            headers: {'Content-Type': 'application/json'}
        });
    },

    deleteAnnouncement: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/system/announcements/${id}`);
    },

    listAnnouncements: async (query?: AnnouncementQuery): Promise<Announcement[]> => {
        return await requesterWithAuthenticationInstance.get(`/system/announcements`, {
            params: query
        });
    },

    getUnreadAnnouncements: async (): Promise<Announcement[]> => {
        return await requesterWithAuthenticationInstance.get(`/system/announcements/unread`);
    },

    markAsRead: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.post(`/system/announcements/${id}/read`);
    }
};

export default AnnouncementApi;
