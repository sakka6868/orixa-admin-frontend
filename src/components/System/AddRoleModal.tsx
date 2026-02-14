import React, {useState} from "react";
import {useModal} from "../../hooks/useModal";
import Button from "../ui/button/Button";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {RoleFormData, Role} from "../../types/user";
import {useMessage} from "../ui/message";
import FoundationApi from "../../api/FoundationApi.ts";
import {AxiosError} from "axios";

interface AddRoleModalProps {
    onAdd?: (roleData: RoleFormData) => void;
    availableParentRoles?: Role[];
}

export default function AddRoleModal({onAdd, availableParentRoles = []}: AddRoleModalProps) {
    const addRoleModal = useModal();
    const message = useMessage();

    const [formData, setFormData] = useState<RoleFormData>({
        name: "",
        code: "",
        description: "",
        parent: null
    });

    const handleInputChange = (field: keyof RoleFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleParentChange = (parentId: string | null) => {
        setFormData(prev => ({
            ...prev,
            parent: parentId ? { id: parentId } : null
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 表单验证
        if (!formData.name.trim()) {
            message.warning("表单验证失败", "请输入角色名称");
            return;
        }

        if (!formData.code.trim()) {
            message.warning("表单验证失败", "请输入角色编码");
            return;
        }

        if (!formData.description.trim()) {
            message.warning("表单验证失败", "请输入角色描述");
            return;
        }

        try {
            await FoundationApi.createRole(formData);
            // 调用回调函数
            if (onAdd) {
                onAdd(formData);
            }
            // 重置表单
            setFormData({
                name: "",
                code: "",
                description: "",
                parent: null
            });
            // 关闭弹窗
            addRoleModal.closeModal();
            message.success("添加成功", "角色已成功添加");
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("添加角色失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("添加角色失败", "未知错误");
        }
    };

    const handleClose = () => {
        // 重置表单
        setFormData({
            name: "",
            code: "",
            description: "",
            parent: null
        });
        addRoleModal.closeModal();
    };

    return (
        <>
            <Button 
                onClick={addRoleModal.openModal}
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
                添加角色
            </Button>
            <Modal
                isOpen={addRoleModal.isOpen}
                onClose={handleClose}
                className="w-full max-w-[600px] p-6 lg:p-10"
            >
                <div className="max-h-[80vh] overflow-y-auto">
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        添加角色
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        填写角色信息，创建新的角色
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* 角色名称 */}
                            <div>
                                <Label>角色名称 *</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入角色名称"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                            </div>

                            {/* 角色编码 */}
                            <div>
                                <Label>角色编码 *</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入角色编码（如：ADMIN）"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange("code", e.target.value)}
                                />
                            </div>

                            {/* 角色描述 */}
                            <div>
                                <Label>角色描述 *</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入角色描述"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                />
                            </div>

                            {/* 父级角色 */}
                            <div>
                                <Label>父级角色</Label>
                                <select
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    value={formData.parent?.id || ""}
                                    onChange={(e) => handleParentChange(e.target.value || null)}
                                >
                                    <option value="">无（顶级角色）</option>
                                    {availableParentRoles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    可选择父级角色，建立角色层级关系
                                </p>
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
