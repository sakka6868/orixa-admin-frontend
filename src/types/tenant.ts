// 租户相关类型定义
import {Role} from "./user.ts";

// 租户视图对象
export interface Tenant {
    id: string;
    name: string;
    status?: string;
    updatedAt?: string;
    // 后端更新：移除 profile，新增顶层字段
    credential: TenantCredential;
    roles: Role[];
    authenticationMethods?: string[];
    authorizationGrantTypes?: string[];
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
}

// 租户凭证
export interface TenantCredential {
    credentialKey: string;
    credentialValue: string;
    oldCredentialValue?: string;
}

// 创建租户命令
export interface CreateTenantCommand {
    name: string;
    // 顶层结构：不再嵌套 profile
    credential: TenantCredential;
    roles: Array<{ id: string }>;
    authenticationMethods?: string[];
    authorizationGrantTypes?: string[];
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
}

// 更新租户命令
export interface UpdateTenantCommand {
    id: string;
    name: string;
    // 顶层结构：不再嵌套 profile
    credential: Partial<TenantCredential> & Pick<TenantCredential, 'credentialKey'>;
    roles: Array<{ id: string }>;
    authenticationMethods?: string[];
    authorizationGrantTypes?: string[];
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
}

// 租户查询参数
export interface TenantQuery {
    name?: string;
}
