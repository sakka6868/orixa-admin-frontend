import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import AddUserModal from "../../components/System/AddUserModal.tsx";
import EditUserModal from "../../components/System/EditUserModal.tsx";
import {User, Role} from "../../types/user.ts";
import FoundationApi from "../../api/FoundationApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Button from "../../components/ui/button/Button.tsx";
import Badge from "../../components/ui/badge/Badge.tsx";
import {useModal} from "../../components/ui/modal";

export default function UserList() {
    const [userList, setUserList] = useState<User[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const message = useMessage();
    const modal = useModal();

    // 页面加载时获取用户数据和角色数据
    useMountEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 获取用户列表
                const users = await FoundationApi.listUsers({});
                setUserList(users);

                // 获取角色列表
                const roles = await FoundationApi.listRoles();
                setAvailableRoles(roles);
            } catch (error) {
                console.error('获取数据失败:', error);
                message.error("加载失败", "获取用户列表或角色数据失败");
            } finally {
                setLoading(false);
            }
        };
        fetchData().then(() => console.log('用户数据加载完成'));
    });

    // 刷新用户列表
    const fetchUserList = async () => {
        try {
            setLoading(true);
            const users = await FoundationApi.listUsers({});
            setUserList(users);
        } catch (error) {
            console.error('获取用户列表失败:', error);
            message.error("加载失败", "获取用户列表失败");
        } finally {
            setLoading(false);
        }
    };

    // 处理添加用户
    const handleAddUser = async () => {
        // 刷新列表
        await fetchUserList();
    };

    // 处理编辑用户
    const handleEditUser = (user: User) => {
        setEditingUser(user);
    };

    // 处理更新用户
    const handleUpdateUser = async () => {
        // 刷新列表
        await fetchUserList();
        setEditingUser(null);
    };

    // 处理删除用户
    const handleDeleteUser = async (id: string) => {
        const confirmed = await modal.confirm({
            title: "确认删除",
            message: "确认删除该用户吗？此操作不可恢复。",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await FoundationApi.deleteUser(id);
                message.success("删除成功", "用户已成功删除");
                // 刷新列表
                await fetchUserList();
            } catch (error) {
                console.error('删除用户失败:', error);
                message.error("删除失败", "删除用户失败");
            }
        }
    };

    // 格式化日期显示
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return dateString;
    };

    return (
        <>
            <PageMeta
                title="用户列表"
                description="用户管理页面"
            />
            <div className="mb-6 flex justify-end">
                <AddUserModal
                    onAdd={handleAddUser}
                    availableRoles={availableRoles}
                />
            </div>
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">加载中...</span>
                </div>
            ) : userList.length > 0 ? (
                <div
                    className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    用户名
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    姓名
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    生日
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    登录账号
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    角色
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {userList.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {user.lastName} {user.firstName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(user.birthday)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {user.profile?.credential?.credentialKey || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {user.profile?.roles?.map((role) => (
                                                <Badge
                                                    key={role.id}
                                                    color="primary"
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {role.name}
                                                </Badge>
                                            )) || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                编辑
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400"
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无用户数据
                    </h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮添加你的第一个用户
                    </p>
                </div>
            )}

            {/* 编辑用户弹窗 */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    isOpen={true}
                    onClose={() => setEditingUser(null)}
                    onUpdate={handleUpdateUser}
                    availableRoles={availableRoles}
                />
            )}
        </>
    );
}
