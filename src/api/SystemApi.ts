import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';
import {MenuFormData} from "../types/menu.ts";

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
    }
}

export default SystemApi;
