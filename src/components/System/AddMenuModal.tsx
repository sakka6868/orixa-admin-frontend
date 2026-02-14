import React, {useState} from "react";
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

interface AddMenuModalProps {
    onAdd?: (menuData: MenuFormData) => void;
    parentMenuOptions?: MenuParent[];
}

export default function AddMenuModal({onAdd, parentMenuOptions = []}: AddMenuModalProps) {
    const addMenuModal = useModal();
    const message = useMessage();

    const [formData, setFormData] = useState<MenuFormData>({
        name: "",
        icon: "",
        type: MenuType.MENU,
        path: "",
        sort: 0,
        parent: null,
        status: MenuStatus.ENABLED,
        level: 0
    });

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
        ...parentMenuOptions.map(parent => ({
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
                    level: 2 // 暂时设置为2级，实际应根据父级层级计算
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

        if (formData.type === MenuType.MENU && !formData.path.trim()) {
            message.warning("表单验证失败", "菜单类型必须填写路径");
            return;
        }
        if (formData.parent) {
            formData.level = formData.parent.level + 1;
        }else {
            formData.level = 0;
        }

        try {
            await SystemApi.createMenu(formData);
            // 调用回调函数
            if (onAdd) {
                onAdd(formData);
            }
            // 重置表单
            setFormData({
                name: "",
                icon: "",
                type: MenuType.MENU,
                path: "",
                sort: 0,
                parent: null,
                status: MenuStatus.ENABLED,
                level: 1
            });
            // 关闭弹窗
            addMenuModal.closeModal();
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("添加菜单失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("添加菜单失败", "未知错误");
        }
    };

    const handleClose = () => {
        // 重置表单
        setFormData({
            name: "",
            icon: "",
            type: MenuType.MENU,
            path: "",
            sort: 0,
            parent: null,
            status: MenuStatus.ENABLED,
            level: 1
        });
        addMenuModal.closeModal();
    };

    return (
        <>
            <Button 
                onClick={addMenuModal.openModal}
                startIcon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="shrink-0"
                    >
                        <path
                            d="M5 10.0002H15.0006M10.0002 5V15.0006"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                }
            >
                添加菜单
            </Button>
            <Modal
                isOpen={addMenuModal.isOpen}
                onClose={handleClose}
                className="w-full max-w-[600px] p-6 lg:p-10"
            >
                <div>
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        添加菜单
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        填写菜单信息，创建新的菜单项
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
                                确认添加
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
