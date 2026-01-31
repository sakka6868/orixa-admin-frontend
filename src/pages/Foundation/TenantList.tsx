import PageMeta from "../../components/common/PageMeta.tsx";
import {useState} from "react";
import {Tenant, CreateTenantCommand, UpdateTenantCommand} from "../../types/tenant.ts";
import {Role} from "../../types/user.ts";
import {CLIENT_AUTHENTICATION_METHODS, AUTHORIZATION_GRANT_TYPES, OAUTH_SCOPES} from "../../types/oauth.ts";
import FoundationApi from "../../api/FoundationApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal/Modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import MultiSelect from "../../components/form/MultiSelect.tsx";
import {useModal} from "../../components/ui/modal";

export default function TenantList() {
    const [tenantList, setTenantList] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchName, setSearchName] = useState<string>("");
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

    // 新增租户弹窗状态
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState<CreateTenantCommand>({
        name: "",
        profile: {
            credential: {
                credentialKey: "",
                credentialValue: ""
            },
            roles: []
        },
        authenticationMethods: [],
        authorizationGrantTypes: [],
        redirectUris: [],
        postLogoutRedirectUris: [],
        scopes: []
    });

    // 编辑租户弹窗状态
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<UpdateTenantCommand>({
        id: "",
        name: "",
        profile: {
            credential: {
                credentialKey: "",
                credentialValue: ""
            },
            roles: []
        },
        authenticationMethods: [],
        authorizationGrantTypes: [],
        redirectUris: [],
        postLogoutRedirectUris: [],
        scopes: []
    });

    const message = useMessage();
    const modal = useModal();

    // 页面加载时获取租户数据和角色列表
    useMountEffect(() => {
        fetchTenantList();
        fetchRoleList();
    });

    // 刷新租户列表
    const fetchTenantList = async (name?: string) => {
        try {
            setLoading(true);
            const tenants = await FoundationApi.listTenants(name ? {name} : {});
            setTenantList(tenants);
        } catch (error) {
            console.error('获取租户列表失败:', error);
            message.error("加载失败", "获取租户列表失败");
        } finally {
            setLoading(false);
        }
    };

    // 获取角色列表
    const fetchRoleList = async () => {
        try {
            const roles = await FoundationApi.listRoles();
            setAvailableRoles(roles);
        } catch (error) {
            console.error('获取角色列表失败:', error);
        }
    };

    // 搜索租户
    const handleSearch = () => {
        fetchTenantList(searchName);
    };

    // 重置搜索
    const handleReset = () => {
        setSearchName("");
        fetchTenantList();
    };

    // 打开新增弹窗
    const handleOpenAddModal = () => {
        setAddFormData({
            name: "",
            profile: {
                credential: {
                    credentialKey: "",
                    credentialValue: ""
                },
                roles: []
            },
            authenticationMethods: [],
            authorizationGrantTypes: [],
            redirectUris: [],
            postLogoutRedirectUris: [],
            scopes: []
        });
        setIsAddModalOpen(true);
    };

    // 处理新增租户
    const handleAddTenant = async () => {
        if (!addFormData.name.trim()) {
            message.warning("表单验证失败", "请输入租户名称");
            return;
        }

        if (!addFormData.profile?.credential.credentialKey.trim()) {
            message.warning("表单验证失败", "请输入登录账号");
            return;
        }

        if (!addFormData.profile?.credential.credentialValue.trim()) {
            message.warning("表单验证失败", "请输入登录密码");
            return;
        }

        try {
            await FoundationApi.createTenant(addFormData);
            message.success("创建成功", "租户已成功创建");
            setIsAddModalOpen(false);
            await fetchTenantList();
        } catch (error) {
            console.error('创建租户失败:', error);
            message.error("创建失败", "创建租户失败");
        }
    };

    // 打开编辑弹窗
    const handleOpenEditModal = (tenant: Tenant) => {
        setEditFormData({
            id: tenant.id,
            name: tenant.name,
            profile: tenant.profile || {
                credential: {
                    credentialKey: "",
                    credentialValue: ""
                },
                roles: []
            },
            authenticationMethods: tenant.authenticationMethods || [],
            authorizationGrantTypes: tenant.authorizationGrantTypes || [],
            redirectUris: tenant.redirectUris || [],
            postLogoutRedirectUris: tenant.postLogoutRedirectUris || [],
            scopes: tenant.scopes || []
        });
        setIsEditModalOpen(true);
    };

    // 处理更新租户
    const handleUpdateTenant = async () => {
        if (!editFormData.name.trim()) {
            message.error("验证失败", "租户名称不能为空");
            return;
        }

        // 如果填写了新密码，则必须填写旧密码
        if (editFormData.profile?.credential.credentialValue?.trim() && !editFormData.profile?.credential.oldCredentialValue?.trim()) {
            message.warning("密码验证失败", "修改密码时请输入旧密码进行验证");
            return;
        }

        try {
            // 清洗提交数据
            const submitData = { ...editFormData };
            if (!submitData.profile?.credential.credentialValue?.trim()) {
                // 如果不修改密码，移除相关字段
                if (submitData.profile) {
                    const { credentialValue, oldCredentialValue, ...otherCredential } = submitData.profile.credential;
                    submitData.profile.credential = otherCredential as any;
                }
            }

            await FoundationApi.updateTenant(submitData);
            message.success("更新成功", "租户已成功更新");
            setIsEditModalOpen(false);
            await fetchTenantList();
        } catch (error) {
            console.error('更新租户失败:', error);
            message.error("更新失败", "更新租户失败");
        }
    };

    // 处理删除租户
    const handleDeleteTenant = async (id: string) => {
        const confirmed = await modal.confirm({
            title: "确认删除",
            message: "确认删除该租户吗？此操作不可恢复。",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await FoundationApi.deleteTenant(id);
                message.success("删除成功", "租户已成功删除");
                await fetchTenantList();
            } catch (error) {
                console.error('删除租户失败:', error);
                message.error("删除失败", "删除租户失败");
            }
        }
    };

    return (
        <>
            <PageMeta
                title="租户列表"
                description="租户管理页面"
            />

            {/* 搜索区域 */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="请输入租户名称"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <Button variant="primary" size="sm" onClick={handleSearch}>
                        搜索
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        重置
                    </Button>
                </div>
                <div className="ml-auto">
                    <Button variant="primary" onClick={handleOpenAddModal}>
                        新增租户
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">加载中...</span>
                </div>
            ) : tenantList.length > 0 ? (
                <div
                    className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    租户名称
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                    状态
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {tenantList.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {tenant.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {tenant.status || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEditModal(tenant)}
                                            >
                                                编辑
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteTenant(tenant.id)}
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无租户数据
                    </h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮添加你的第一个租户
                    </p>
                </div>
            )}

            {/* 新增租户弹窗 */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
                   className="relative w-full max-w-[600px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900">
                <div className="max-h-[80vh] overflow-y-auto">
                    <h2 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white">
                        新增租户
                    </h2>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        填写租户信息，创建新的租户
                    </p>
                    <div className="space-y-4">
                        {/* 租户名称 */}
                        <div>
                            <Label>租户名称 <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="请输入租户名称"
                                value={addFormData.name}
                                onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                            />
                        </div>

                        {/* 登录账号 */}
                        <div>
                            <Label>登录账号 <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="请输入管理员登录账号"
                                value={addFormData.profile?.credential.credentialKey || ""}
                                onChange={(e) => setAddFormData({
                                    ...addFormData,
                                    profile: {
                                        ...addFormData.profile!,
                                        credential: {
                                            ...addFormData.profile!.credential,
                                            credentialKey: e.target.value
                                        }
                                    }
                                })}
                            />
                        </div>

                        {/* 登录密码 */}
                        <div>
                            <Label>登录密码 <span className="text-red-500">*</span></Label>
                            <Input
                                type="password"
                                placeholder="请输入管理员登录密码"
                                value={addFormData.profile?.credential.credentialValue || ""}
                                onChange={(e) => setAddFormData({
                                    ...addFormData,
                                    profile: {
                                        ...addFormData.profile!,
                                        credential: {
                                            ...addFormData.profile!.credential,
                                            credentialValue: e.target.value
                                        }
                                    }
                                })}
                            />
                        </div>

                        {/* 认证方法 */}
                        <div>
                            <MultiSelect
                                label="认证方法"
                                options={CLIENT_AUTHENTICATION_METHODS.map(m => ({value: m.value, text: m.label}))}
                                defaultSelected={addFormData.authenticationMethods || []}
                                onChange={(selected) => setAddFormData({
                                    ...addFormData,
                                    authenticationMethods: selected
                                })}
                            />
                        </div>

                        {/* 授权类型 */}
                        <div>
                            <MultiSelect
                                label="授权类型"
                                options={AUTHORIZATION_GRANT_TYPES.map(t => ({value: t.value, text: t.label}))}
                                defaultSelected={addFormData.authorizationGrantTypes || []}
                                onChange={(selected) => setAddFormData({
                                    ...addFormData,
                                    authorizationGrantTypes: selected
                                })}
                            />
                        </div>

                        {/* 重定向URI */}
                        <div>
                            <Label>重定向URI</Label>
                            <Input
                                type="text"
                                placeholder="请输入重定向URI，多个用逗号分隔"
                                value={addFormData.redirectUris?.join(',') || ""}
                                onChange={(e) => setAddFormData({
                                    ...addFormData,
                                    redirectUris: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                                })}
                            />
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                例如：https://example.com/callback
                            </p>
                        </div>

                        {/* 登出后重定向URI */}
                        <div>
                            <Label>登出后重定向URI</Label>
                            <Input
                                type="text"
                                placeholder="请输入登出后重定向URI，多个用逗号分隔"
                                value={addFormData.postLogoutRedirectUris?.join(',') || ""}
                                onChange={(e) => setAddFormData({
                                    ...addFormData,
                                    postLogoutRedirectUris: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                                })}
                            />
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                例如：https://example.com/logout
                            </p>
                        </div>

                        {/* 作用域 */}
                        <div>
                            <MultiSelect
                                label="作用域"
                                options={OAUTH_SCOPES.map(s => ({value: s.value, text: s.label}))}
                                defaultSelected={addFormData.scopes || []}
                                onChange={(selected) => setAddFormData({
                                    ...addFormData,
                                    scopes: selected
                                })}
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
                                                checked={addFormData.profile?.roles.some(r => r.id === role.id) || false}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setAddFormData({
                                                        ...addFormData,
                                                        profile: {
                                                            ...addFormData.profile!,
                                                            roles: checked
                                                                ? [...addFormData.profile!.roles, role]
                                                                : addFormData.profile!.roles.filter(r => r.id !== role.id)
                                                        }
                                                    });
                                                }}
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
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            取消
                        </Button>
                        <Button variant="primary" onClick={handleAddTenant}>
                            确定
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* 编辑租户弹窗 */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
                   className="relative w-full max-w-[600px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900">
                <div className="max-h-[80vh] overflow-y-auto">
                    <h2 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white">
                        编辑租户
                    </h2>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        修改租户信息
                    </p>
                    <div className="space-y-4">
                        {/* 租户名称 */}
                        <div>
                            <Label>租户名称 <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="请输入租户名称"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                            />
                        </div>

                        {/* 登录账号 */}
                        <div>
                            <Label>登录账号</Label>
                            <Input
                                type="text"
                                placeholder="请输入管理员登录账号"
                                value={editFormData.profile?.credential.credentialKey || ""}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    profile: {
                                        ...editFormData.profile!,
                                        credential: {
                                            ...editFormData.profile!.credential,
                                            credentialKey: e.target.value
                                        }
                                    }
                                })}
                            />
                        </div>

                        {/* 登录密码 */}
                        <div>
                            <Label>旧密码（修改密码时必填）</Label>
                            <Input
                                type="password"
                                placeholder="请输入旧密码进行验证"
                                value={editFormData.profile?.credential.oldCredentialValue || ""}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    profile: {
                                        ...editFormData.profile!,
                                        credential: {
                                            ...editFormData.profile!.credential,
                                            oldCredentialValue: e.target.value
                                        }
                                    }
                                })}
                            />
                        </div>

                        <div>
                            <Label>新密码（留空则不修改）</Label>
                            <Input
                                type="password"
                                placeholder="请输入新密码"
                                value={editFormData.profile?.credential.credentialValue || ""}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    profile: {
                                        ...editFormData.profile!,
                                        credential: {
                                            ...editFormData.profile!.credential,
                                            credentialValue: e.target.value
                                        }
                                    }
                                })}
                            />
                        </div>

                        {/* 认证方法 */}
                        <div>
                            <MultiSelect
                                label="认证方法"
                                options={CLIENT_AUTHENTICATION_METHODS.map(m => ({value: m.value, text: m.label}))}
                                defaultSelected={editFormData.authenticationMethods || []}
                                onChange={(selected) => setEditFormData({
                                    ...editFormData,
                                    authenticationMethods: selected
                                })}
                            />
                        </div>

                        {/* 授权类型 */}
                        <div>
                            <MultiSelect
                                label="授权类型"
                                options={AUTHORIZATION_GRANT_TYPES.map(t => ({value: t.value, text: t.label}))}
                                defaultSelected={editFormData.authorizationGrantTypes || []}
                                onChange={(selected) => setEditFormData({
                                    ...editFormData,
                                    authorizationGrantTypes: selected
                                })}
                            />
                        </div>

                        {/* 重定向URI */}
                        <div>
                            <Label>重定向URI</Label>
                            <Input
                                type="text"
                                placeholder="请输入重定向URI，多个用逗号分隔"
                                value={editFormData.redirectUris?.join(',') || ""}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    redirectUris: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                                })}
                            />
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                例如：https://example.com/callback
                            </p>
                        </div>

                        {/* 登出后重定向URI */}
                        <div>
                            <Label>登出后重定向URI</Label>
                            <Input
                                type="text"
                                placeholder="请输入登出后重定向URI，多个用逗号分隔"
                                value={editFormData.postLogoutRedirectUris?.join(',') || ""}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    postLogoutRedirectUris: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                                })}
                            />
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                例如：https://example.com/logout
                            </p>
                        </div>

                        {/* 作用域 */}
                        <div>
                            <MultiSelect
                                label="作用域"
                                options={OAUTH_SCOPES.map(s => ({value: s.value, text: s.label}))}
                                defaultSelected={editFormData.scopes || []}
                                onChange={(selected) => setEditFormData({
                                    ...editFormData,
                                    scopes: selected
                                })}
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
                                                checked={editFormData.profile?.roles.some(r => r.id === role.id) || false}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setEditFormData({
                                                        ...editFormData,
                                                        profile: {
                                                            ...editFormData.profile!,
                                                            roles: checked
                                                                ? [...editFormData.profile!.roles, role]
                                                                : editFormData.profile!.roles.filter(r => r.id !== role.id)
                                                        }
                                                    });
                                                }}
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
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            取消
                        </Button>
                        <Button variant="primary" onClick={handleUpdateTenant}>
                            确定
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
