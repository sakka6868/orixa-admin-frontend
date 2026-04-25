import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import SystemConfigApi, {SystemConfig, SystemConfigQuery, CreateSystemConfigCommand} from "../../api/SystemConfigApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import {useModal} from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge.tsx";
import Input from "../../components/form/input/InputField";
import SystemConfigModal from "../../components/Foundation/SystemConfigModal.tsx";

export default function SystemConfigList() {
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);

    // 筛选条件
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterConfigKey, setFilterConfigKey] = useState<string>('');

    const message = useMessage();
    const modal = useModal();

    useMountEffect(() => {
        fetchConfigs();
    });

    const fetchConfigs = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const query: SystemConfigQuery = {
                page: pageNum,
                size: pageSize,
                category: filterCategory || undefined,
                configKey: filterConfigKey || undefined
            };
            const result = await SystemConfigApi.listSystemConfigs(query);
            setConfigs(result.records);
            setTotal(result.total);
            setTotalPages(result.totalPages);
            setPage(result.current);
        } catch (error) {
            console.error('获取配置列表失败:', error);
            message.error("加载失败", "获取配置列表失败");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchConfigs(1);
    };

    const handleReset = () => {
        setFilterCategory('');
        setFilterConfigKey('');
        fetchConfigs(1);
    };

    const handleCreate = async (data: CreateSystemConfigCommand) => {
        try {
            await SystemConfigApi.createSystemConfig(data);
            message.success("创建成功", "配置已创建");
            await fetchConfigs();
        } catch (error) {
            console.error('创建配置失败:', error);
            message.error("创建失败", "创建配置失败");
            throw error;
        }
    };

    const handleUpdate = async (id: string, configValue: string, description?: string) => {
        try {
            await SystemConfigApi.updateSystemConfig({id, configValue, description});
            message.success("更新成功", "配置已更新");
            setEditingConfig(null);
            await fetchConfigs();
        } catch (error) {
            console.error('更新配置失败:', error);
            message.error("更新失败", "更新配置失败");
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await modal.confirm({
            title: "确认删除",
            message: "确认删除该配置吗？此操作不可恢复。",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await SystemConfigApi.deleteSystemConfig(id);
                message.success("删除成功", "配置已删除");
                await fetchConfigs();
            } catch (error) {
                console.error('删除配置失败:', error);
                message.error("删除失败", "删除配置失败");
            }
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'STRING':
                return <Badge color="dark" variant="light" size="sm">字符串</Badge>;
            case 'NUMBER':
                return <Badge color="info" variant="light" size="sm">数字</Badge>;
            case 'BOOLEAN':
                return <Badge color="warning" variant="light" size="sm">布尔</Badge>;
            case 'JSON':
                return <Badge color="dark" variant="light" size="sm">JSON</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{type}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'GENERAL':
                return <Badge color="dark" variant="light" size="sm">通用</Badge>;
            case 'SECURITY':
                return <Badge color="error" variant="light" size="sm">安全</Badge>;
            case 'EMAIL':
                return <Badge color="info" variant="light" size="sm">邮件</Badge>;
            case 'NOTIFICATION':
                return <Badge color="warning" variant="light" size="sm">通知</Badge>;
            default:
                return <Badge color="dark" variant="light" size="sm">{category}</Badge>;
        }
    };

    return (
        <>
            <PageMeta
                title="系统配置 | Orixa Admin"
                description="系统配置管理页面"
            />

            {/* 筛选器 */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">全部</option>
                            <option value="GENERAL">通用</option>
                            <option value="SECURITY">安全</option>
                            <option value="EMAIL">邮件</option>
                            <option value="NOTIFICATION">通知</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">配置键</label>
                        <Input
                            type="text"
                            placeholder="搜索配置键"
                            value={filterConfigKey}
                            onChange={(e) => setFilterConfigKey(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button variant="primary" size="md" onClick={handleSearch}>搜索</Button>
                        <Button variant="outline" size="md" onClick={handleReset}>重置</Button>
                    </div>
                </div>
            </div>

            {/* 创建按钮 */}
            <div className="mb-6 flex justify-end">
                <SystemConfigModal onSubmit={handleCreate} />
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
                                {['配置键', '配置值', '类型', '分类', '描述', '操作'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {Array.from({length: 5}).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-48 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-5 w-16 rounded-full"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-5 w-16 rounded-full"></div></td>
                                    <td className="px-4 py-3"><div className="skeleton h-4 w-32 rounded"></div></td>
                                    <td className="px-4 py-3"><div className="flex gap-2"><div className="skeleton h-8 w-16 rounded-lg"></div><div className="skeleton h-8 w-16 rounded-lg"></div></div></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : configs.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    配置键
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    配置值
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    类型
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    分类
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    描述
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {configs.map((config) => (
                                <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {config.configKey}
                                            </span>
                                            {config.isReadonly && (
                                                <Badge color="dark" variant="light" size="sm">只读</Badge>
                                            )}
                                            {config.isEncrypted && (
                                                <Badge color="warning" variant="light" size="sm">加密</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" title={config.configValue}>
                                        {config.isEncrypted ? '********' : (config.configValue.length > 50 ? config.configValue.substring(0, 50) + '...' : config.configValue)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getTypeBadge(config.configType)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getCategoryBadge(config.category)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {config.description || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {!config.isReadonly && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingConfig(config)}
                                                >
                                                    编辑
                                                </Button>
                                            )}
                                            {!config.isReadonly && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(config.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    删除
                                                </Button>
                                            )}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无配置
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮创建你的第一个配置
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
                        onClick={() => fetchConfigs(page - 1)}
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
                        onClick={() => fetchConfigs(page + 1)}
                    >
                        下一页
                    </Button>
                </div>
            )}

            {/* 编辑弹窗 */}
            {editingConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">编辑配置</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">配置键</label>
                                <Input type="text" value={editingConfig.configKey} disabled />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">配置值</label>
                                {editingConfig.isEncrypted ? (
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            value={editingConfig.configValue}
                                            onChange={(e) => setEditingConfig({...editingConfig, configValue: e.target.value})}
                                            placeholder="加密值不可见"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">加密配置项值不可在前端编辑</p>
                                    </div>
                                ) : (
                                    <Input
                                        type="text"
                                        value={editingConfig.configValue}
                                        onChange={(e) => setEditingConfig({...editingConfig, configValue: e.target.value})}
                                    />
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
                                <Input
                                    type="text"
                                    value={editingConfig.description || ''}
                                    onChange={(e) => setEditingConfig({...editingConfig, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingConfig(null)}>取消</Button>
                            {!editingConfig.isEncrypted && (
                                <Button variant="primary" onClick={() => handleUpdate(editingConfig.id, editingConfig.configValue, editingConfig.description)}>保存</Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
