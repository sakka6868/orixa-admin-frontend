import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import MessageApi, {Message, MessageQuery, CreateMessageCommand} from "../../api/MessageApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import {useModal} from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge.tsx";
import MessageModal from "../../components/Foundation/MessageModal.tsx";
import {useCurrentStaff} from "../../hooks/useCurrentStaff.ts";

type MessageTab = 'INBOX' | 'SENT';

export default function MessageList() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<MessageTab>('INBOX');
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const message = useMessage();
    const modal = useModal();
    const { staff } = useCurrentStaff();

    useMountEffect(() => {
        fetchMessages();
        fetchUnreadCount();
    });

    const fetchMessages = async (pageNum: number = 1, tab: MessageTab = activeTab) => {
        try {
            setLoading(true);
            const query: MessageQuery = {
                page: pageNum,
                size: pageSize
            };
            if (tab === 'INBOX') {
                query.receiverId = staff?.userId;
                query.messageType = 'INBOX';
            } else {
                query.senderId = staff?.userId;
                query.messageType = 'SENT';
            }
            const result = await MessageApi.listMessages(query);
            setMessages(result.records);
            setTotal(result.total);
            setTotalPages(result.totalPages);
            setPage(result.current);
        } catch (error) {
            console.error('获取消息列表失败:', error);
            message.error("加载失败", "获取消息列表失败");
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await MessageApi.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('获取未读消息数失败:', error);
        }
    };

    const handleTabChange = (tab: MessageTab) => {
        setActiveTab(tab);
        setPage(1);
        fetchMessages(1, tab);
    };

    const handleSendMessage = async (data: CreateMessageCommand) => {
        try {
            await MessageApi.createMessage(data);
            message.success("发送成功", "消息已发送");
        } catch (error) {
            console.error('发送消息失败:', error);
            message.error("发送失败", "消息发送失败");
            throw error;
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await MessageApi.markAsRead(messageId);
            await fetchMessages();
            await fetchUnreadCount();
        } catch (error) {
            console.error('标记已读失败:', error);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await modal.confirm({
            title: "确认删除",
            message: "确认删除该消息吗？",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await MessageApi.deleteMessage(id);
                message.success("删除成功", "消息已删除");
                await fetchMessages();
                await fetchUnreadCount();
            } catch (error) {
                console.error('删除消息失败:', error);
                message.error("删除失败", "删除消息失败");
            }
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return <Badge color="error" variant="light" size="sm">紧急</Badge>;
            case 'NORMAL':
                return <Badge color="dark" variant="light" size="sm">普通</Badge>;
            case 'LOW':
                return <Badge color="dark" variant="light" size="sm">低</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{priority}</Badge>;
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
                title="站内信 | Orixa Admin"
                description="站内消息管理页面"
            />

            {/* 标签页和发送按钮 */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-4">
                    <button
                        onClick={() => handleTabChange('INBOX')}
                        className={`pb-2 text-sm font-medium transition-colors ${
                            activeTab === 'INBOX'
                                ? 'border-b-2 border-brand-500 text-brand-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        收件箱 {unreadCount > 0 && <span className="ml-1 text-red-500">({unreadCount})</span>}
                    </button>
                    <button
                        onClick={() => handleTabChange('SENT')}
                        className={`pb-2 text-sm font-medium transition-colors ${
                            activeTab === 'SENT'
                                ? 'border-b-2 border-brand-500 text-brand-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        发件箱
                    </button>
                </div>
                <MessageModal
                    onSubmit={handleSendMessage}
                    onSent={() => {
                        fetchMessages();
                        fetchUnreadCount();
                    }}
                />
            </div>

            {/* 统计信息 */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                共 {total} 条记录，第 {page}/{totalPages || 1} 页
            </div>

            {/* 数据表格 */}
            {loading ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                {['优先级', '标题', activeTab === 'INBOX' ? '发件人' : '收件人', '时间', '操作'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {Array.from({length: 5}).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3"><div className="skeleton h-5 w-12 rounded-full"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-48 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-24 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="flex gap-2"><div className="skeleton h-8 w-16 rounded-lg"></div><div className="skeleton h-8 w-16 rounded-lg"></div></div></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : messages.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    优先级
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    标题
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    {activeTab === 'INBOX' ? '发件人' : '收件人'}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    时间
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {messages.map((msg) => (
                                <tr key={msg.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 ${!msg.isRead && activeTab === 'INBOX' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                    <td className="px-4 py-3">
                                        {getPriorityBadge(msg.priority)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {!msg.isRead && activeTab === 'INBOX' && (
                                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                            )}
                                            <span className={`text-sm font-medium ${!msg.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {msg.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        {activeTab === 'INBOX' ? msg.senderName : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(msg.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            {!msg.isRead && activeTab === 'INBOX' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(msg.id)}
                                                >
                                                    标记已读
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(msg.id)}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无{activeTab === 'INBOX' ? '收件' : '发件'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activeTab === 'INBOX' ? '您还没有收到任何消息' : '您还没有发送过任何消息'}
                    </p>
                </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => fetchMessages(page - 1)}
                    >
                        上一页
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-700 dark:text-gray-300">
                        第 {page} / {totalPages} 页
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => fetchMessages(page + 1)}
                    >
                        下一页
                    </Button>
                </div>
            )}
        </>
    );
}
