import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import {Announcement, AnnouncementFormData} from "../../types/announcement.ts";
import AnnouncementApi from "../../api/AnnouncementApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import {useModal} from "../../components/ui/modal";
import Badge from "../../components/ui/badge/Badge.tsx";
import Button from "../../components/ui/button/Button";
import AnnouncementModal from "../../components/Foundation/AnnouncementModal.tsx";

export default function AnnouncementList() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const message = useMessage();
    const confirmModal = useModal();

    useMountEffect(() => {
        fetchAnnouncements().then(() => console.log('公告数据加载完成'));
    });

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const list = await AnnouncementApi.listAnnouncements({});
            setAnnouncements(list);
        } catch (error) {
            console.error('获取公告列表失败:', error);
            message.error("加载失败", "获取公告列表失败");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: AnnouncementFormData) => {
        try {
            await AnnouncementApi.createAnnouncement(data);
            message.success("创建成功", "公告已创建");
            setIsModalOpen(false);
            await fetchAnnouncements();
        } catch (error) {
            console.error('创建公告失败:', error);
            message.error("创建失败", "创建公告失败");
            throw error;
        }
    };

    const handleUpdate = async (data: AnnouncementFormData) => {
        if (!editingAnnouncement) return;
        try {
            await AnnouncementApi.updateAnnouncement(editingAnnouncement.id, data);
            message.success("更新成功", "公告已更新");
            setIsModalOpen(false);
            setEditingAnnouncement(null);
            await fetchAnnouncements();
        } catch (error) {
            console.error('更新公告失败:', error);
            message.error("更新失败", "更新公告失败");
            throw error;
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmModal.confirm({
            title: "确认删除",
            message: "确认删除该公告吗？此操作不可恢复。",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await AnnouncementApi.deleteAnnouncement(id);
                message.success("删除成功", "公告已删除");
                await fetchAnnouncements();
            } catch (error) {
                console.error('删除公告失败:', error);
                message.error("删除失败", "删除公告失败");
            }
        }
    };

    const handlePublish = async (announcement: Announcement) => {
        try {
            await AnnouncementApi.updateAnnouncement(announcement.id, {
                title: announcement.title,
                content: announcement.content,
                priority: announcement.priority,
                status: 'PUBLISHED'
            });
            message.success("发布成功", "公告已发布");
            await fetchAnnouncements();
        } catch (error) {
            console.error('发布公告失败:', error);
            message.error("发布失败", "发布公告失败");
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return <Badge color="error" variant="light" size="sm">高</Badge>;
            case 'NORMAL':
                return <Badge color="warning" variant="light" size="sm">普通</Badge>;
            case 'LOW':
                return <Badge color="dark" variant="light" size="sm">低</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{priority}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <Badge color="dark" variant="light" size="sm">草稿</Badge>;
            case 'PUBLISHED':
                return <Badge color="success" variant="light" size="sm">已发布</Badge>;
            case 'ARCHIVED':
                return <Badge color="warning" variant="light" size="sm">已归档</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{status}</Badge>;
        }
    };

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <PageMeta
                title="系统公告 | Orixa Admin"
                description="系统公告管理页面"
            />

            <div className="mb-6 flex justify-end">
                <Button variant="primary" size="md" onClick={() => {
                    setEditingAnnouncement(null);
                    setIsModalOpen(true);
                }}>
                    创建公告
                </Button>
            </div>

            {loading ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                {['标题', '优先级', '状态', '创建时间', '发布时间', '操作'].map((h) => (
                                    <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {Array.from({length: 5}).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-48 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-5 w-12 rounded-full"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-5 w-16 rounded-full"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="flex gap-2"><div className="skeleton h-8 w-16 rounded-lg"></div><div className="skeleton h-8 w-16 rounded-lg"></div></div></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : announcements.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    标题
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    优先级
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    状态
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    创建时间
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    发布时间
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {announcements.map((announcement) => (
                                <tr key={announcement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {announcement.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getPriorityBadge(announcement.priority)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(announcement.status)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(announcement.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(announcement.publishedAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(announcement)}
                                            >
                                                编辑
                                            </Button>
                                            {announcement.status === 'DRAFT' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePublish(announcement)}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    发布
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(announcement.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                删除
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
                    <svg className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无公告
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮创建你的第一个公告
                    </p>
                </div>
            )}

            {isModalOpen && (
                <AnnouncementModal
                    announcement={editingAnnouncement}
                    isOpen={true}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingAnnouncement(null);
                    }}
                    onSubmit={editingAnnouncement ? handleUpdate : handleCreate}
                />
            )}
        </>
    );
}
