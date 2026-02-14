import React, {useState, useEffect} from "react";
import Button from "../ui/button/Button";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {StaffFormData, StaffListItem, MenuVo} from "../../types/staff";
import {User} from "../../types/user";
import {useMessage} from "../ui/message";
import SystemApi from "../../api/SystemApi.ts";
import {AxiosError} from "axios";
import Tree from "../ui/tree";
import {TreeNode} from "../ui/tree/types";

interface EditStaffModalProps {
    staff: StaffListItem;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (staffData: StaffFormData) => void;
    availableMenus?: MenuVo[];
    availableUsers?: User[];
}

export default function EditStaffModal({
    staff,
    isOpen,
    onClose,
    onUpdate,
    availableMenus = [],
    availableUsers = []
}: EditStaffModalProps) {
    const message = useMessage();

    const [formData, setFormData] = useState<StaffFormData>({
        id: staff.id,
        userId: staff.userId,
        menus: staff.menus
    });

    // 当 staff prop 变化时，同步更新 formData
    useEffect(() => {
        setFormData({
            id: staff.id,
            userId: staff.userId,
            menus: staff.menus
        });
    }, [staff]);

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
                        icon: menu.icon
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
            await SystemApi.updateStaff(staff.id, formData);
            // 调用回调函数
            if (onUpdate) {
                onUpdate(formData);
            }
            onClose();
            message.success("更新成功", "员工信息已成功更新");
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("更新员工失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("更新员工失败", "未知错误");
        }
    };

    const handleClose = () => {
        // 重置表单
        setFormData({
            id: staff.id,
            userId: staff.userId,
            menus: staff.menus
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="w-full max-w-[600px] p-6 lg:p-10"
        >
            <div>
                <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                    编辑员工
                </h4>
                <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    修改员工信息
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* 用户显示（禁止编辑） */}
                        <div>
                            <Label>用户</Label>
                            <Input
                                type="text"
                                value={availableUsers.find(u => u.id === formData.userId)?.name || formData.userId}
                                disabled={true}
                                className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
                            />
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                用户信息不可修改
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
                            确认更新
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
