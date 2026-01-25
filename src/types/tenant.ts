// 租户相关类型定义
import {Role} from "./user.ts";

// 租户视图对象
export interface Tenant {
    id: string;
    name: string;
    status?: string;
    updatedAt?: string;
    profile?: TenantProfile;
    authenticationMethods?: string[];
    authorizationGrantTypes?: string[];
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
}

// 租户配置
export interface TenantProfile {
    credential: TenantCredential;
    roles: Role[];
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
    profile?: TenantProfile;
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
    profile?: TenantProfile;
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
