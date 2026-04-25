import React, {useState, useEffect} from "react";
import {useModal} from "../../hooks/useModal";
import Button from "../ui/button/Button";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import {MenuFormData, MenuParent, MenuStatus, MenuType} from "../../types/menu";
import {useMessage} from "../ui/message";
import SystemApi from "../../api/SystemApi.ts";
import {AxiosError} from "axios";

interface EditMenuModalProps {
    menu: {
        id: string;
        name: string;
        icon?: string;
        type: MenuType;
        path?: string;
        sort: number;
        parent?: MenuParent;
        status: MenuStatus;
        level: number;
    };
    parentMenuOptions?: MenuParent[];
    onUpdate?: (menuData: MenuFormData) => void;
}

export default function EditMenuModal({menu, parentMenuOptions = [], onUpdate}: EditMenuModalProps) {
    const editMenuModal = useModal();
    const message = useMessage();

    const [formData, setFormData] = useState<MenuFormData>({
        name: menu.name,
        icon: menu.icon || "",
        type: menu.type,
        path: menu.path || "",
        sort: menu.sort,
        parent: menu.parent || null,
        status: menu.status,
        level: menu.level
    });

    useEffect(() => {
        setFormData({
            name: menu.name,
            icon: menu.icon || "",
            type: menu.type,
            path: menu.path || "",
            sort: menu.sort,
            parent: menu.parent || null,
            status: menu.status,
            level: menu.level
        });
    }, [menu]);

    const menuTypeOptions = [
        {value: MenuType.MENU, label: "菜单"},
        {value: MenuType.DIRECTORY, label: "目录"}
    ];

    const menuStatusOptions = [
        {value: MenuStatus.ENABLED, label: "启用"},
        {value: MenuStatus.DISABLED, label: "禁用"}
    ];

    const parentMenuOptionsForSelect = [
        {value: "", label: "无（顶级菜单）"},
        ...parentMenuOptions
            .filter(p => p.id !== menu.id) // 排除自身
            .map(parent => ({
                value: parent.id,
                label: parent.name
            }))
    ];

    const handleInputChange = (field: keyof MenuFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleParentChange = (parentId: string) => {
        if (parentId === "") {
            setFormData(prev => ({
                ...prev,
                parent: null,
                level: 1
            }));
        } else {
            const selectedParent = parentMenuOptions.find(p => p.id === parentId);
            if (selectedParent) {
                setFormData(prev => ({
                    ...prev,
                    parent: selectedParent,
                    level: selectedParent.level + 1
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 表单验证
        if (!formData.name.trim()) {
            message.warning("表单验证失败", "请输入菜单名称");
            return;
        }

        if (formData.type === MenuType.MENU && !formData.path?.trim()) {
            message.warning("表单验证失败", "菜单类型必须填写路径");
            return;
        }

        if (formData.parent) {
            formData.level = formData.parent.level + 1;
        } else {
            formData.level = 0;
        }

        try {
            await SystemApi.updateMenu(menu.id, formData);
            message.success("更新成功", "菜单已更新");
            if (onUpdate) {
                onUpdate(formData);
            }
            editMenuModal.closeModal();
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("更新菜单失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("更新菜单失败", "未知错误");
        }
    };

    const handleClose = () => {
        editMenuModal.closeModal();
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={editMenuModal.openModal}
            >
                编辑
            </Button>
            <Modal
                isOpen={editMenuModal.isOpen}
                onClose={handleClose}
                className="w-full max-w-[600px] p-6 lg:p-10"
            >
                <div>
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        编辑菜单
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        修改菜单信息
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* 菜单名称 */}
                            <div>
                                <Label>菜单名称 *</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入菜单名称"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                            </div>

                            {/* 菜单图标 */}
                            <div>
                                <Label>菜单图标</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入图标名称或class"
                                    value={formData.icon}
                                    onChange={(e) => handleInputChange("icon", e.target.value)}
                                />
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    例如：icon-dashboard 或 fa fa-home
                                </p>
                            </div>

                            {/* 菜单类型 */}
                            <div>
                                <Label>菜单类型 *</Label>
                                <Select
                                    options={menuTypeOptions}
                                    placeholder="选择菜单类型"
                                    defaultValue={formData.type}
                                    onChange={(value) => handleInputChange("type", value as MenuType)}
                                />
                            </div>

                            {/* 菜单路径 */}
                            <div>
                                <Label>菜单路径 {formData.type === MenuType.MENU ? "*" : ""}</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入菜单路径，如 /dashboard"
                                    value={formData.path}
                                    onChange={(e) => handleInputChange("path", e.target.value)}
                                />
                            </div>

                            {/* 排序 */}
                            <div>
                                <Label>排序</Label>
                                <Input
                                    type="number"
                                    placeholder="数字越小越靠前"
                                    value={formData.sort}
                                    onChange={(e) => handleInputChange("sort", parseInt(e.target.value) || 0)}
                                />
                            </div>

                            {/* 父级菜单 */}
                            <div>
                                <Label>父级菜单</Label>
                                <Select
                                    options={parentMenuOptionsForSelect}
                                    placeholder="选择父级菜单"
                                    defaultValue={formData.parent?.id || ""}
                                    onChange={handleParentChange}
                                />
                            </div>

                            {/* 菜单状态 */}
                            <div>
                                <Label>菜单状态 *</Label>
                                <Select
                                    options={menuStatusOptions}
                                    placeholder="选择菜单状态"
                                    defaultValue={formData.status}
                                    onChange={(value) => handleInputChange("status", value as MenuStatus)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col-reverse sm:flex-row w-full items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="w-full sm:w-auto"
                            >
                                取消
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                            >
                                保存修改
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
