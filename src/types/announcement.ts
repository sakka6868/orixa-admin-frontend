export interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AnnouncementFormData {
    title: string;
    content: string;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
}

export interface AnnouncementQuery {
    status?: string;
    priority?: string;
    page?: number;
    size?: number;
}
