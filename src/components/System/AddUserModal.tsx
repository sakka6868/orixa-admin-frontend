import React, {useState} from "react";
import {useModal} from "../../hooks/useModal";
import Button from "../ui/button/Button";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import DatePicker from "../form/date-picker";
import {UserFormData, Role} from "../../types/user";
import {useMessage} from "../ui/message";
import FoundationApi from "../../api/FoundationApi";
import {AxiosError} from "axios";

interface AddUserModalProps {
    onAdd?: (userData: UserFormData) => void;
    availableRoles?: Role[];
}

export default function AddUserModal({onAdd, availableRoles = []}: AddUserModalProps) {
    const addUserModal = useModal();
    const message = useMessage();

    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        firstName: "",
        lastName: "",
        birthday: null,
        avatar: null,
        profile: {
            credential: {
                credentialKey: "",
                credentialValue: ""
            },
            roles: []
        }
    });

    const handleInputChange = (field: string, value: string | null) => {
        if (field === "credentialKey" || field === "credentialValue") {
            setFormData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    credential: {
                        ...prev.profile.credential,
                        [field]: value || ""
                    }
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleRoleChange = (roleId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                roles: checked
                    ? [...prev.profile.roles, { id: roleId }]
                    : prev.profile.roles.filter(role => role.id !== roleId)
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 表单验证
        if (!formData.name.trim()) {
            message.warning("表单验证失败", "请输入用户名");
            return;
        }

        if (!formData.profile.credential.credentialKey.trim()) {
            message.warning("表单验证失败", "请输入登录账号");
            return;
        }

        if (!formData.profile.credential.credentialValue?.trim()) {
            message.warning("表单验证失败", "请输入登录密码");
            return;
        }

        try {
            await FoundationApi.createUser(formData);
            // 调用回调函数
            if (onAdd) {
                onAdd(formData);
            }
            // 重置表单
            setFormData({
                name: "",
                firstName: "",
                lastName: "",
                birthday: null,
                avatar: null,
                profile: {
                    credential: {
                        credentialKey: "",
                        credentialValue: ""
                    },
                    roles: []
                }
            });
            // 关闭弹窗
            addUserModal.closeModal();
            message.success("添加成功", "用户已成功添加");
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("添加用户失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("添加用户失败", "未知错误");
        }
    };

    const handleClose = () => {
        // 重置表单
        setFormData({
            name: "",
            firstName: "",
            lastName: "",
            birthday: null,
            avatar: null,
            profile: {
                credential: {
                    credentialKey: "",
                    credentialValue: ""
                },
                roles: []
            }
        });
        addUserModal.closeModal();
    };

    return (
        <>
            <Button onClick={addUserModal.openModal}>
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
                添加用户
            </Button>
            <Modal
                isOpen={addUserModal.isOpen}
                onClose={handleClose}
                className="relative w-full max-w-[600px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
            >
                <div className="max-h-[80vh] overflow-y-auto">
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        添加用户
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        填写用户信息，创建新的用户账号
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* 用户名 */}
                            <div>
                                <Label>用户名 *</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入用户名"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                            </div>

                            {/* 名字和姓氏 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>名字</Label>
                                    <Input
                                        type="text"
                                        placeholder="请输入名字（可选）"
                                        value={formData.firstName || ""}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>姓氏</Label>
                                    <Input
                                        type="text"
                                        placeholder="请输入姓氏（可选）"
                                        value={formData.lastName || ""}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 生日 */}
                            <div>
                                <DatePicker
                                    id="add-user-birthday"
                                    label="生日"
                                    placeholder="请选择生日"
                                    defaultDate={formData.birthday || undefined}
                                    onChange={(selectedDates, dateStr) => {
                                        console.log("Selected Dates:", selectedDates);
                                        handleInputChange("birthday", dateStr || null);
                                    }}
                                />
                            </div>

                            {/* 头像URL */}
                            <div>
                                <Label>头像URL</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入头像URL（可选）"
                                    value={formData.avatar || ""}
                                    onChange={(e) => handleInputChange("avatar", e.target.value || null)}
                                />
                            </div>

                            {/* 登录账号 */}
                            <div>
                                <Label>登录账号 *</Label>
                                <Input
                                    type="text"
                                    placeholder="请输入登录账号"
                                    value={formData.profile.credential.credentialKey}
                                    onChange={(e) => handleInputChange("credentialKey", e.target.value)}
                                />
                            </div>

                            {/* 登录密码 */}
                            <div>
                                <Label>登录密码 *</Label>
                                <Input
                                    type="password"
                                    placeholder="请输入登录密码"
                                    value={formData.profile.credential.credentialValue || ""}
                                    onChange={(e) => handleInputChange("credentialValue", e.target.value)}
                                />
                            </div>

                            {/* 角色选择 */}
                            <div>
                                <Label>角色</Label>
                                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                    {availableRoles.length > 0 ? (
                                        availableRoles.map((role) => (
                                            <label
                                                key={role.id}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.profile.roles.some(r => r.id === role.id)}
                                                    onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {role.name}
                                                </span>
                                                {role.description && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        - {role.description}
                                                    </span>
                                                )}
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">暂无可用角色</p>
                                    )}
                                </div>
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    可选择多个角色
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
