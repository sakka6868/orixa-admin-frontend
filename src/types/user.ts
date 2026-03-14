// 用户相关类型定义

// 角色信息
export interface Role {
    id: string;
    name: string;
    code: string;
    description: string;
    parent: Role | null;
    children: Role[];
}

// 凭证信息
export interface Credential {
    credentialKey: string;
    credentialValue: string;
}

// Holder 信息
export interface Holder {
    holderId: string;
    holderType: string;
}

// 用户列表项
export interface User {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    birthday: string | null;
    avatar: string | null;
    // 后端更新：移除 profile，新增顶层字段
    credential: Credential;
    roles: Role[];
}

// 用户表单数据（新增/编辑用）
export interface UserFormData {
    id?: string;
    name: string;
    firstName?: string;
    lastName?: string;
    birthday: string | null;
    avatar?: string | null;
    // 后端更新：表单结构同步为顶层 credential 与 roles
    credential: {
        credentialKey: string;
        credentialValue?: string; // 新增时必填，编辑时可选
    };
    roles: Array<{ id: string }>; // 角色对象数组
}

// 用户查询参数
export interface UserQuery {
    name?: string;
}

// 角色表单数据（新增/编辑用）
export interface RoleFormData {
    id?: string;
    name: string;
    code: string;
    description: string;
    parent?: { id: string } | null;
}

// 角色查询参数
export interface RoleQuery {
    name?: string;
    code?: string;
}
