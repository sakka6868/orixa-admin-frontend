import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import AddStaffModal from "../../components/System/AddStaffModal.tsx";
import EditStaffModal from "../../components/System/EditStaffModal.tsx";
import {MenuVo, StaffListItem} from "../../types/staff";
import {User} from "../../types/user.ts";
import SystemApi from "../../api/SystemApi.ts";
import FoundationApi from "../../api/FoundationApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Button from "../../components/ui/button/Button";
import {useSidebar} from "../../context/SidebarContext";
import {useModal} from "../../components/ui/modal";
import Badge from "../../components/ui/badge/Badge.tsx";

interface MenuApiData {
    id?: string;
    name: string;
    path: string;
    icon?: string;
    children?: MenuApiData[];
}

export default function StaffList() {
    const [staffList, setStaffList] = useState<StaffListItem[]>([]);
    const [userList, setUserList] = useState<User[]>([]);
    const [availableMenus, setAvailableMenus] = useState<MenuVo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingStaff, setEditingStaff] = useState<StaffListItem | null>(null);
    const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);

    const message = useMessage();
    const {refreshMenu} = useSidebar();
    const modal = useModal();

    // 页面加载时获取员工数据和菜单数据
    useMountEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 获取员工列表
                const staffs = await SystemApi.listStaffs({});
                setStaffList(staffs);

                // 获取用户列表
                const users = await FoundationApi.listUsers({});
                setUserList(users);

                // 获取菜单列表（用于权限选择，保留树形结构）
                const menus = await SystemApi.listMenus({} as any);
                // 递归转换菜单数据为 MenuVo 格式，保留树形结构
                const convertToMenuVo = (menuList: MenuApiData[]): MenuVo[] => {
                    return menuList.map((menu) => ({
                        id: menu.id || '',
                        name: menu.name || '',
                        path: menu.path || '',
                        icon: menu.icon || '',
                        children: menu.children ? convertToMenuVo(menu.children) : undefined
                    } as MenuVo & { children?: MenuVo[] }));
                };
                const menuVos = convertToMenuVo(menus as unknown as MenuApiData[]);
                setAvailableMenus(menuVos);
                
                // 获取当前员工ID
                const currentStaff = await SystemApi.getCurrentStaff();
                if (currentStaff) {
                    setCurrentStaffId(currentStaff.id);
                }
            } catch (error) {
                console.error('获取数据失败:', error);
                message.error("加载失败", "获取员工列表或菜单数据失败");
            } finally {
                setLoading(false);
            }
        };
        fetchData().then(() => console.log('员工数据加载完成'));
    });

    // 处理添加员工
    const handleAddStaff = async () => {
        // 刷新列表
        await fetchStaffList();
    };

    // 处理编辑员工
    const handleEditStaff = (staff: StaffListItem) => {
        setEditingStaff(staff);
    };

    // 处理更新员工
    const handleUpdateStaff = async () => {
        // 刷新列表
        await fetchStaffList();
        
        // 如果编辑的是当前员工，刷新侧边栏菜单
        if (editingStaff && currentStaffId && editingStaff.id === currentStaffId) {
            refreshMenu();
        }
        
        setEditingStaff(null);
    };

    // 处理删除员工
    const handleDeleteStaff = async (id: string) => {
        const confirmed = await modal.confirm({
            title: "确认删除",
            message: "确认删除该员工吗？此操作不可恢复。",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await SystemApi.deleteStaff(id);
                message.success("删除成功", "员工已成功删除");
                // 刷新列表
                await fetchStaffList();
            } catch (error) {
                console.error('删除员工失败:', error);
                message.error("删除失败", "删除员工失败");
            }
        }
    };

    // 刷新员工列表
    const fetchStaffList = async () => {
        try {
            const staffs = await SystemApi.listStaffs({});
            setStaffList(staffs);
        } catch (error) {
            console.error('获取员工列表失败:', error);
        }
    };

    return (
        <>
            <PageMeta
                title="员工列表"
                description="员工管理页面"
            />
            <div className="mb-6 flex justify-end">
                <AddStaffModal
                    onAdd={handleAddStaff}
                    availableMenus={availableMenus}
                    availableUsers={userList}
                />
            </div>
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">加载中...</span>
                </div>
            ) : staffList.length > 0 ? (
                <div
                    className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    用户名
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    菜单权限
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {staffList.map((staff) => (
                                <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {staff.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {userList.find(u => u.id === staff.userId)?.name || staff.userId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {staff.menus.map((menu) => (
                                                <Badge
                                                    key={menu.id}
                                                    color="primary"
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {menu.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditStaff(staff)}
                                            >
                                                编辑
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteStaff(staff.id)}
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
                        暂无员工数据
                    </h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮添加你的第一个员工
                    </p>
                </div>
            )}

            {/* 编辑员工弹窗 */}
            {editingStaff && (
                <EditStaffModal
                    staff={editingStaff}
                    isOpen={true}
                    onClose={() => setEditingStaff(null)}
                    onUpdate={handleUpdateStaff}
                    availableMenus={availableMenus}
                    availableUsers={userList}
                />
            )}
        </>
    );
}
