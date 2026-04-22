import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import OperationLogApi, {OperationLog, OperationLogQuery} from "../../api/OperationLogApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge.tsx";
import Input from "../../components/form/input/InputField";

export default function OperationLogList() {
    const [logs, setLogs] = useState<OperationLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // 筛选条件
    const [filterUsername, setFilterUsername] = useState<string>('');
    const [filterModule, setFilterModule] = useState<string>('');
    const [filterOperationType, setFilterOperationType] = useState<string>('');

    const message = useMessage();

    useMountEffect(() => {
        fetchLogs();
    });

    const fetchLogs = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const query: OperationLogQuery = {
                page: pageNum,
                size: pageSize,
                username: filterUsername || undefined,
                module: filterModule || undefined,
                operationType: filterOperationType || undefined
            };
            const result = await OperationLogApi.listOperationLogs(query);
            setLogs(result.records);
            setTotal(result.total);
            setTotalPages(result.totalPages);
            setPage(result.current);
        } catch (error) {
            console.error('获取操作日志失败:', error);
            message.error("加载失败", "获取操作日志失败");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchLogs(1);
    };

    const handleReset = () => {
        setFilterUsername('');
        setFilterModule('');
        setFilterOperationType('');
        fetchLogs(1);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <Badge color="success" variant="light" size="sm">成功</Badge>;
            case 'FAILED':
                return <Badge color="error" variant="light" size="sm">失败</Badge>;
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
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const truncateText = (text: string | null, maxLength: number = 50) => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <>
            <PageMeta
                title="操作日志 | Orixa Admin"
                description="操作日志查询页面"
            />

            {/* 筛选器 */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">用户名</label>
                        <Input
                            type="text"
                            placeholder="模糊搜索用户名"
                            value={filterUsername}
                            onChange={(e) => setFilterUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">模块</label>
                        <Input
                            type="text"
                            placeholder="模块名称"
                            value={filterModule}
                            onChange={(e) => setFilterModule(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">操作类型</label>
                        <Input
                            type="text"
                            placeholder="操作类型"
                            value={filterOperationType}
                            onChange={(e) => setFilterOperationType(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
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
                                {['用户名', '模块', '操作类型', '操作对象', '状态', 'IP地址', '操作时间', '详情'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {Array.from({length: 5}).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-24 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-20 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-16 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-5 w-12 rounded-full"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-24 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-36 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-48 rounded"></div></td>
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
                                    用户名
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    模块
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    操作类型
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    操作对象
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    状态
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    IP地址
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    操作时间
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    详情
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {log.username || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        {log.module}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        {log.operationType}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        {log.targetType && log.targetName
                                            ? `${log.targetType}: ${log.targetName}`
                                            : log.targetType || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(log.status)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {log.ipAddress || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(log.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" title={log.detail}>
                                        {truncateText(log.detail, 60)}
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
                        暂无操作日志
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        符合条件的操作日志将显示在这里
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
