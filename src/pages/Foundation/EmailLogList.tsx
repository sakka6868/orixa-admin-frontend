import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import EmailLogApi, {EmailLog, EmailLogQuery} from "../../api/EmailLogApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge.tsx";
import Input from "../../components/form/input/InputField";

export default function EmailLogList() {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // 筛选条件
    const [filterToAddress, setFilterToAddress] = useState<string>('');
    const [filterEmailType, setFilterEmailType] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    const message = useMessage();

    useMountEffect(() => {
        fetchLogs();
    });

    const fetchLogs = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const query: EmailLogQuery = {
                page: pageNum,
                size: pageSize,
                toAddress: filterToAddress || undefined,
                emailType: filterEmailType || undefined,
                status: filterStatus || undefined
            };
            const result = await EmailLogApi.listEmailLogs(query);
            setLogs(result.records);
            setTotal(result.total);
            setTotalPages(result.totalPages);
            setPage(result.current);
        } catch (error) {
            console.error('获取邮件日志失败:', error);
            message.error("加载失败", "获取邮件日志失败");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchLogs(1);
    };

    const handleReset = () => {
        setFilterToAddress('');
        setFilterEmailType('');
        setFilterStatus('');
        fetchLogs(1);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SENT':
                return <Badge color="success" variant="light" size="sm">已发送</Badge>;
            case 'FAILED':
                return <Badge color="error" variant="light" size="sm">失败</Badge>;
            case 'PENDING':
                return <Badge color="warning" variant="light" size="sm">待发送</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'NOTIFICATION':
                return <Badge color="info" variant="light" size="sm">通知</Badge>;
            case 'VERIFICATION':
                return <Badge color="dark" variant="light" size="sm">验证</Badge>;
            case 'PASSWORD_RESET':
                return <Badge color="warning" variant="light" size="sm">密码重置</Badge>;
            case 'BULK':
                return <Badge color="dark" variant="light" size="sm">群发</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{type}</Badge>;
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
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const truncateText = (text: string | null, maxLength: number = 60) => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <>
            <PageMeta
                title="邮件日志 | Orixa Admin"
                description="邮件发送日志查询页面"
            />

            {/* 筛选器 */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">收件人</label>
                        <Input
                            type="text"
                            placeholder="搜索收件人邮箱"
                            value={filterToAddress}
                            onChange={(e) => setFilterToAddress(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">邮件类型</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            value={filterEmailType}
                            onChange={(e) => setFilterEmailType(e.target.value)}
                        >
                            <option value="">全部</option>
                            <option value="NOTIFICATION">通知</option>
                            <option value="VERIFICATION">验证</option>
                            <option value="PASSWORD_RESET">密码重置</option>
                            <option value="BULK">群发</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">状态</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">全部</option>
                            <option value="SENT">已发送</option>
                            <option value="FAILED">失败</option>
                            <option value="PENDING">待发送</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button variant="primary" size="md" onClick={handleSearch}>搜索</Button>
                        <Button variant="outline" size="md" onClick={handleReset}>重置</Button>
                    </div>
                </div>
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
                                {['收件人', '主题', '类型', '状态', '发送时间', '创建时间'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {Array.from({length: 5}).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-40 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-48 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-5 w-16 rounded-full"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-5 w-16 rounded-full"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-32 rounded"></div></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : logs.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    收件人
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    主题
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    类型
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    状态
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    发送时间
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    创建时间
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {truncateText(log.toAddress, 40)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        {truncateText(log.subject, 50)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getTypeBadge(log.emailType)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(log.status)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(log.sentAt)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(log.createdAt)}
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
                        暂无邮件日志
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        邮件发送记录将显示在这里
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
                        onClick={() => fetchLogs(page - 1)}
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
                        onClick={() => fetchLogs(page + 1)}
                    >
                        下一页
                    </Button>
                </div>
            )}
        </>
    );
}
