import React, {useState} from "react";
import {useModal} from "../../hooks/useModal";
import Button from "../ui/button/Button";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import {StaffFormData, MenuVo} from "../../types/staff";
import {User} from "../../types/user";
import {useMessage} from "../ui/message";
import SystemApi from "../../api/SystemApi.ts";
import {AxiosError} from "axios";
import Tree from "../ui/tree";
import {TreeNode} from "../ui/tree/types";

interface AddStaffModalProps {
    onAdd?: (staffData: StaffFormData) => void;
    availableMenus?: MenuVo[];
    availableUsers?: User[];
}

export default function AddStaffModal({onAdd, availableMenus = [], availableUsers = []}: AddStaffModalProps) {
    const addStaffModal = useModal();
    const message = useMessage();

    const [formData, setFormData] = useState<StaffFormData>({
        userId: "",
        menus: []
    });

    const handleInputChange = (field: keyof StaffFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMenusChange = (checkedKeys: string[]) => {
        // 递归查找所有选中的菜单（包括子菜单）
        const findMenusByIds = (menus: MenuVo[], ids: string[]): MenuVo[] => {
            let result: MenuVo[] = [];
            menus.forEach(menu => {
                if (ids.includes(menu.id)) {
                    // 只保存菜单的基本信息，不包括 children
                    result.push({
                        id: menu.id,
                        name: menu.name,
                        path: menu.path,
                        icon: menu.icon,
                        type: menu.type
                    });
                }
                if (menu.children) {
                    result = result.concat(findMenusByIds(menu.children, ids));
                }
            });
            return result;
        };
        
        const selectedMenus = findMenusByIds(availableMenus, checkedKeys);
        setFormData(prev => ({
            ...prev,
            menus: selectedMenus
        }));
    };

    // 将菜单数据转换为树形结构
    const convertMenusToTree = (menus: MenuVo[]): TreeNode[] => {
        return menus.map(menu => ({
            key: menu.id,
            title: menu.name,
            children: menu.children ? convertMenusToTree(menu.children) : undefined
        }));
    };

    // 递归获取所有菜单 ID（包括嵌套的子菜单）
    const getAllMenuIds = (menus: MenuVo[]): string[] => {
        let ids: string[] = [];
        menus.forEach(menu => {
            ids.push(menu.id);
            if (menu.children && menu.children.length > 0) {
                ids = ids.concat(getAllMenuIds(menu.children));
            }
        });
        return ids;
    };

    const treeData = convertMenusToTree(availableMenus);
    const checkedMenuIds = getAllMenuIds(formData.menus);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 表单验证
        if (!formData.userId.trim()) {
            message.warning("表单验证失败", "请选择用户");
            return;
        }

        if (formData.menus.length === 0) {
            message.warning("表单验证失败", "请至少选择一个菜单权限");
            return;
        }

        try {
            await SystemApi.createStaff(formData);
            // 调用回调函数
            if (onAdd) {
                onAdd(formData);
            }
            // 重置表单
            setFormData({
                userId: "",
                menus: []
            });
            // 关闭弹窗
            addStaffModal.closeModal();
            message.success("添加成功", "员工已成功添加");
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("添加员工失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("添加员工失败", "未知错误");
        }
    };

    const handleClose = () => {
        // 重置表单
        setFormData({
            userId: "",
            menus: []
        });
        addStaffModal.closeModal();
    };

    return (
        <>
            <Button onClick={addStaffModal.openModal}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                >
                    <path
                        d="M5 10.0002H15.0006M10.0002 5V15.0006"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                添加员工
            </Button>
            <Modal
                isOpen={addStaffModal.isOpen}
                onClose={handleClose}
                className="relative w-full max-w-[600px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
            >
                <div>
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        添加员工
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        填写员工信息，创建新的员工账号
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* 用户选择 */}
                            <div>
                                <Label>用户 *</Label>
                                <select
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    value={formData.userId}
                                    onChange={(e) => handleInputChange("userId", e.target.value)}
                                >
                                    <option value="">请选择用户</option>
                                    {availableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    选择要分配员工权限的用户
                                </p>
                            </div>

                            {/* 菜单权限 */}
                            <div>
                                <Label>菜单权限 *</Label>
                                <div className="mt-2">
                                    <Tree
                                        treeData={treeData}
                                        checkable={true}
                                        defaultExpandAll={true}
                                        checkedKeys={checkedMenuIds}
                                        onCheck={(checkedKeys) => handleMenusChange(checkedKeys)}
                                        checkStrictly={true}
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    可选择多个菜单权限
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row w-full items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="w-full"
                            >
                                取消
                            </Button>
                            <Button className="w-full"
                                    type="submit"
                            >
                                确认添加
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
