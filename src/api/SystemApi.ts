import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';
import {MenuFormData} from "../types/menu.ts";
import {StaffFormData, StaffListItem, StaffQuery} from "../types/staff.ts";

const SystemApi = {
    createMenu: async (menu: MenuFormData): Promise<MenuFormData> => {
        return await requesterWithAuthenticationInstance.post(`/system/menus`, menu, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    listMenus: async (menu: MenuFormData): Promise<MenuFormData[]> => {
        return await requesterWithAuthenticationInstance.get(`/system/menus`, {
            params: menu
        });
    },

    // 员工管理相关 API
    createStaff: async (staff: StaffFormData): Promise<StaffListItem> => {
        return await requesterWithAuthenticationInstance.post(`/system/staffs`, staff, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    updateStaff: async (id: string, staff: StaffFormData): Promise<StaffListItem> => {
        return await requesterWithAuthenticationInstance.put(`/system/staffs/${id}`, staff, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    listStaffs: async (query: StaffQuery): Promise<StaffListItem[]> => {
        return await requesterWithAuthenticationInstance.get(`/system/staffs`, {
            params: query
        });
    },
    deleteStaff: async (id: string): Promise<void> => {
        return await requesterWithAuthenticationInstance.delete(`/system/staffs/${id}`);
    },
    getCurrentStaff: async (): Promise<StaffListItem> => {
        return await requesterWithAuthenticationInstance.get(`/system/staffs/current`);
    }
}

export default SystemApi;
