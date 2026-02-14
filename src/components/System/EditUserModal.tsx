import React, {useState, useEffect} from "react";
import Button from "../ui/button/Button";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import DatePicker from "../form/date-picker";
import {UserFormData, User, Role} from "../../types/user";
import {useMessage} from "../ui/message";
import FoundationApi from "../../api/FoundationApi";
import {AxiosError} from "axios";

interface EditUserModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (userData: UserFormData) => void;
    availableRoles?: Role[];
}

export default function EditUserModal({
    user,
    isOpen,
    onClose,
    onUpdate,
    availableRoles = []
}: EditUserModalProps) {
    const message = useMessage();

    const [formData, setFormData] = useState<UserFormData>({
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        birthday: user.birthday,
        avatar: user.avatar,
        profile: {
            credential: {
                credentialKey: user.profile?.credential?.credentialKey || "",
                credentialValue: "" // 编辑时密码不回显，留空表示不修改
            },
            roles: user.profile?.roles?.map(role => ({ id: role.id })) || []
        }
    });

    // 旧密码状态
    const [oldCredentialValue, setOldCredentialValue] = useState<string>("");

    // 当 user prop 变化时，同步更新 formData
    useEffect(() => {
        setFormData({
            id: user.id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            birthday: user.birthday,
            avatar: user.avatar,
            profile: {
                credential: {
                    credentialKey: user.profile?.credential?.credentialKey || "",
                    credentialValue: ""
                },
                roles: user.profile?.roles?.map(role => ({ id: role.id })) || []
            }
        });
        setOldCredentialValue("");
    }, [user]);

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

        // 如果要修改密码，必须输入旧密码
        if (formData.profile.credential.credentialValue?.trim()) {
            if (!oldCredentialValue.trim()) {
                message.warning("密码验证失败", "请输入旧密码进行验证");
                return;
            }
        }

        try {
            // 如果要修改密码，需要包含旧密码
            const submitData: any = {...formData};
            
            if (formData.profile.credential.credentialValue?.trim()) {
                // 更新密码，需要提供旧密码
                submitData.profile.credential.oldCredentialValue = oldCredentialValue;
            } else {
                // 不修改密码，删除密码字段
                delete submitData.profile.credential.credentialValue;
            }
            
            await FoundationApi.updateUser(user.id, submitData);
            // 调用回调函数
            if (onUpdate) {
                onUpdate(formData);
            }
            onClose();
            message.success("更新成功", "用户信息已成功更新");
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                message.error("更新用户失败", error.response?.data?.message || "未知错误");
                return;
            }
            message.error("更新用户失败", "未知错误");
        }
    };

    const handleClose = () => {
        // 重置表单
        setFormData({
            id: user.id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            birthday: user.birthday,
            avatar: user.avatar,
            profile: {
                credential: {
                    credentialKey: user.profile?.credential?.credentialKey || "",
                    credentialValue: ""
                },
                roles: user.profile?.roles?.map(role => ({ id: role.id })) || []
            }
        });
        setOldCredentialValue("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="w-full max-w-[600px] p-6 lg:p-10"
        >
            <div className="max-h-[80vh] overflow-y-auto">
                <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                    编辑用户
                </h4>
                <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    修改用户信息
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
                                id="edit-user-birthday"
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

                        {/* 修改密码区域 */}
                        <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <Label className="text-sm font-medium">修改密码（可选）</Label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                                如需修改密码，请填写以下字段
                            </p>
                            
                            {/* 旧密码 */}
                            <div>
                                <Label>旧密码</Label>
                                <Input
                                    type="password"
                                    placeholder="请输入旧密码"
                                    value={oldCredentialValue}
                                    onChange={(e) => setOldCredentialValue(e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    修改密码时必须输入旧密码进行验证
                                </p>
                            </div>

                            {/* 新密码 */}
                            <div>
                                <Label>新密码</Label>
                                <Input
                                    type="password"
                                    placeholder="请输入新密码"
                                    value={formData.profile.credential.credentialValue || ""}
                                    onChange={(e) => handleInputChange("credentialValue", e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    留空则不修改密码
                                </p>
                            </div>
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
                            确认更新
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
