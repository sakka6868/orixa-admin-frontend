import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';
import {Role, RoleFormData, RoleQuery, User, UserFormData, UserQuery} from "../types/user.ts";
import {Tenant, CreateTenantCommand, UpdateTenantCommand, TenantQuery} from "../types/tenant.ts";

const FoundationApi = {
    getCurrentUser: async (): Promise<Authorization> => {
        return await requesterWithAuthenticationInstance.get(`/foundation/users/current`);
    },
    // 用户管理相关 API
    createUser: async (user: UserFormData): Promise<User> => {
        return await requesterWithAuthenticationInstance.post(`/foundation/users`, user, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    updateUser: async (id: string, user: UserFormData): Promise<User> => {
        return await requesterWithAuthenticationInstance.put(`/foundation/users/${id}`, user, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    listUsers: async (query: UserQuery): Promise<User[]> => {
        return await requesterWithAuthenticationInstance.get(`/foundation/users`, {
            params: query
        });
    },
    deleteUser: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/foundation/users/${id}`);
    },
    listRoles: async (query?: RoleQuery): Promise<Role[]> => {
        return await requesterWithAuthenticationInstance.get(`/foundation/roles`, {
            params: query
        });
    },
    // 角色管理相关 API
    createRole: async (role: RoleFormData): Promise<Role> => {
        return await requesterWithAuthenticationInstance.post(`/foundation/roles`, role, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    updateRole: async (id: string, role: RoleFormData): Promise<Role> => {
        return await requesterWithAuthenticationInstance.put(`/foundation/roles/${id}`, role, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    deleteRole: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/foundation/roles/${id}`);
    },

    // 租户管理相关 API
    listTenants: async (query?: TenantQuery): Promise<Tenant[]> => {
        return await requesterWithAuthenticationInstance.get(`/foundation/tenants`, {
            params: query
        });
    },
    createTenant: async (command: CreateTenantCommand): Promise<Tenant> => {
        return await requesterWithAuthenticationInstance.post(`/foundation/tenants`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    updateTenant: async (command: UpdateTenantCommand): Promise<Tenant> => {
        return await requesterWithAuthenticationInstance.put(`/foundation/tenants`, command, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    deleteTenant: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/foundation/tenants/${id}`);
    }
}

export default FoundationApi;
