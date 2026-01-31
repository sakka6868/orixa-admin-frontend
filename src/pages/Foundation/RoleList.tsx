import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import AddRoleModal from "../../components/System/AddRoleModal.tsx";
import EditRoleModal from "../../components/System/EditRoleModal.tsx";
import {Role} from "../../types/user.ts";
import FoundationApi from "../../api/FoundationApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Button from "../../components/ui/button/Button.tsx";
import React from "react";
import {useModal} from "../../components/ui/modal";

export default function RoleList() {
    const [roleList, setRoleList] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const message = useMessage();
    const modal = useModal();

    // 页面加载时获取角色数据
    useMountEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 获取角色列表
                const roles = await FoundationApi.listRoles();
                setRoleList(roles);
            } catch (error) {
                console.error('获取数据失败:', error);
                message.error("加载失败", "获取角色列表失败");
            } finally {
                setLoading(false);
            }
        };
        fetchData().then(() => console.log('角色数据加载完成'));
    });

    // 刷新角色列表
    const fetchRoleList = async () => {
        try {
            setLoading(true);
            const roles = await FoundationApi.listRoles();
            setRoleList(roles);
        } catch (error) {
            console.error('获取角色列表失败:', error);
            message.error("加载失败", "获取角色列表失败");
        } finally {
            setLoading(false);
        }
    };

    // 处理添加角色
    const handleAddRole = async () => {
        // 刷新列表
        await fetchRoleList();
    };

    // 处理编辑角色
    const handleEditRole = (role: Role) => {
        setEditingRole(role);
    };

    // 处理更新角色
    const handleUpdateRole = async () => {
        // 刷新列表
        await fetchRoleList();
        setEditingRole(null);
    };

    // 处理删除角色
    const handleDeleteRole = async (id: string) => {
        const confirmed = await modal.confirm({
            title: "确认删除",
            message: "确认删除该角色吗？此操作不可恢复。",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await FoundationApi.deleteRole(id);
                message.success("删除成功", "角色已成功删除");
                // 刷新列表
                await fetchRoleList();
            } catch (error) {
                console.error('删除角色失败:', error);
                message.error("删除失败", "删除角色失败");
            }
        }
    };

    // 渲染角色层级（递归显示父子关系）
    const renderRoleHierarchy = (role: Role, level: number = 0) => {
        const indent = level * 24; // 每层缩进24px
        
        return (
            <React.Fragment key={role.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2" style={{paddingLeft: `${indent}px`}}>
                            {level > 0 && (
                                <span className="text-gray-400 dark:text-gray-600">
                                    └─
                                </span>
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {role.name}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white">
                            {role.code}
                        </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {role.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {role.parent?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRole(role)}
                            >
                                编辑
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                                删除
                            </Button>
                        </div>
                    </td>
                </tr>
                {role.children && role.children.length > 0 && (
                    role.children.map(child => renderRoleHierarchy(child, level + 1))
                )}
            </React.Fragment>
        );
    };

    // 获取顶级角色（没有父级的角色）
    const getTopLevelRoles = () => {
        return roleList.filter(role => !role.parent);
    };

    return (
        <>
            <PageMeta
                title="角色列表"
                description="角色管理页面"
            />
            <div className="mb-6 flex justify-end">
                <AddRoleModal
                    onAdd={handleAddRole}
                    availableParentRoles={roleList}
                />
            </div>
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">加载中...</span>
                </div>
            ) : roleList.length > 0 ? (
                <div
                    className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    角色名称
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    角色编码
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    角色描述
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    父级角色
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {getTopLevelRoles().map((role) => renderRoleHierarchy(role))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
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
                        暂无角色数据
                    </h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮添加你的第一个角色
                    </p>
                </div>
            )}

            {/* 编辑角色弹窗 */}
            {editingRole && (
                <EditRoleModal
                    role={editingRole}
                    isOpen={true}
                    onClose={() => setEditingRole(null)}
                    onUpdate={handleUpdateRole}
                    availableParentRoles={roleList}
                />
            )}
        </>
    );
}
