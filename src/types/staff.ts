import { MenuType } from "./menu";

// 员工相关类型定义

// 菜单 VO（用于员工关联的菜单）
export interface MenuVo {
    id: string;
    name: string;
    path: string;
    type: MenuType;
    icon?: string;
    children?: MenuVo[];
}

// 员工表单数据接口
export interface StaffFormData {
    id?: string;
    userId: string;
    menus: MenuVo[];
}

// 员工列表数据接口
export interface StaffListItem {
    id: string;
    userId: string;
    menus: MenuVo[];
}

export interface StaffQuery {
    name?: string;
}