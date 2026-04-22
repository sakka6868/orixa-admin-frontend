import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import LoginLogApi, {LoginLog, LoginLogQuery, Page} from "../../api/LoginLogApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Badge from "../../components/ui/badge/Badge.tsx";
import Button from "../../components/ui/button/Button";

export default function LoginLogList() {
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [query, setQuery] = useState<LoginLogQuery>({
        username: '',
        loginType: '',
        loginStatus: '',
        page: 1,
        size: 20
    });

    const message = useMessage();

    useMountEffect(() => {
        fetchLoginLogs().then(() => console.log('登录日志数据加载完成'));
    });

    const fetchLoginLogs = async () => {
        try {
            setLoading(true);
            const result: Page<LoginLog> = await LoginLogApi.listLoginLogs({...query, page});
            setLoginLogs(result.records);
            setTotalPages(result.totalPages);
            setTotal(result.total);
        } catch (error) {
            console.error('获取登录日志失败:', error);
            message.error("加载失败", "获取登录日志列表失败");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchLoginLogs();
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchLoginLogs();
        }
    };

    const getLoginTypeLabel = (type: string) => {
        switch (type) {
            case 'PASSWORD': return '密码登录';
            case 'OAUTH2_GITHUB': return 'GitHub';
            case 'OAUTH2_GOOGLE': return 'Google';
            default: return type;
        }
    };

    const getLoginStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <Badge color="success" variant="light" size="sm">成功</Badge>;
            case 'FAILED':
                return <Badge color="error" variant="light" size="sm">失败</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{status}</Badge>;
        }
    };

    const formatDateTime = (dateStr: string) => {
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

    return (
        <>
            <PageMeta
                title="登录日志 | Orixa Admin"
                description="登录日志管理页面"
            />

            {/* 筛选区域 */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            用户名
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="搜索用户名"
                            value={query.username || ''}
                            onChange={(e) => setQuery({...query, username: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            登录类型
                        </label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            value={query.loginType || ''}
                            onChange={(e) => setQuery({...query, loginType: e.target.value})}
                        >
                            <option value="">全部</option>
                            <option value="PASSWORD">密码登录</option>
                            <option value="OAUTH2_GITHUB">GitHub</option>
                            <option value="OAUTH2_GOOGLE">Google</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            登录状态
                        </label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            value={query.loginStatus || ''}
                            onChange={(e) => setQuery({...query, loginStatus: e.target.value})}
                        >
                            <option value="">全部</option>
                            <option value="SUCCESS">成功</option>
                            <option value="FAILED">失败</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button variant="primary" size="md" onClick={handleSearch}>
                            搜索
                        </Button>
                    </div>
                </div>
            </div>

            {/* 统计信息 */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    共 {total} 条记录，第 {page}/{totalPages} 页
                </p>
            </div>

            {/* 表格区域 */}
            {loading ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                {['用户名', '登录类型', '状态', 'IP地址', '登录时间', '备注'].map((h) => (
                                    <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {Array.from({length: 5}).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-16 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-5 w-12 rounded-full"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-20 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded"></div></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : loginLogs.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    用户名
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    登录类型
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    状态
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    IP地址
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    登录时间
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    备注
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loginLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {log.username}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {getLoginTypeLabel(log.loginType)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getLoginStatusBadge(log.loginStatus)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {log.ipAddress || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {formatDateTime(log.loginTime)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {log.failureReason || '-'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                第 {page} 页，共 {totalPages} 页
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => handlePageChange(page - 1)}
                                >
                                    上一页
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => handlePageChange(page + 1)}
                                >
                                    下一页
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
                    <svg
                        className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无登录日志
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        登录日志将显示在这里
                    </p>
                </div>
            )}
        </>
    );
}
