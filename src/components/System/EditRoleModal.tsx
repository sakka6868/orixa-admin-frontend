import React, {useState, useEffect} from "react";
import Button from "../ui/button/Button";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {RoleFormData, Role} from "../../types/user";
import {useMessage} from "../ui/message";
import FoundationApi from "../../api/FoundationApi.ts";
import {AxiosError} from "axios";

interface EditRoleModalProps {
    role: Role;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (roleData: RoleFormData) => void;
    availableParentRoles?: Role[];
}

export default function EditRoleModal({
    role,
    isOpen,
    onClose,
    onUpdate,
    availableParentRoles = []
}: EditRoleModalProps) {
    const message = useMessage();

    const [formData, setFormData] = useState<RoleFormData>({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        parent: role.parent ? { id: role.parent.id } : null
    });

    // 当 role prop 变化时，同步更新 formData
    useEffect(() => {
        setFormData({
            id: role.id,
            name: role.name,
            code: role.code,
            description: role.description,
            parent: role.parent ? { id: role.parent.id } : null
        });
    }, [role]);

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
            await FoundationApi.updateRole(role.id, formData);
            // 调用回调函数
            if (onUpdate) {
                onUpdate(formData);
            }
            onClose();
            message.success("更新成功", "角色信息已成功更新");
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("更新角色失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("更新角色失败", "未知错误");
        }
    };

    const handleClose = () => {
        // 重置表单
        setFormData({
            id: role.id,
            name: role.name,
            code: role.code,
            description: role.description,
            parent: role.parent ? { id: role.parent.id } : null
        });
        onClose();
    };

    // 过滤掉当前角色及其子孙角色，避免循环引用
    const getAvailableParentRoles = () => {
        const excludedIds = new Set<string>([role.id]);
        
        // 递归收集所有子孙角色ID
        const collectDescendants = (r: Role) => {
            if (r.children) {
                r.children.forEach(child => {
                    excludedIds.add(child.id);
                    collectDescendants(child);
                });
            }
        };
        collectDescendants(role);
        
        return availableParentRoles.filter(r => !excludedIds.has(r.id));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="relative w-full max-w-[600px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
        >
            <div className="max-h-[80vh] overflow-y-auto">
                <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                    编辑角色
                </h4>
                <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    修改角色信息
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
                                {getAvailableParentRoles().map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                可选择父级角色，建立角色层级关系
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
