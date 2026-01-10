// 菜单相关类型定义

// 菜单类型枚举
export enum MenuType {
    MENU = "MENU",
    DIRECTORY = "DIRECTORY"
}

// 菜单状态枚举
export enum MenuStatus {
    ENABLED = "ENABLED",
    DISABLED = "DISABLED"
}

// 父级菜单 VO
export interface MenuParent {
    id: string;
    name: string;
    level: number;
}

// 菜单表单数据接口
export interface MenuFormData {
    name: string;
    icon: string;
    type: MenuType;
    path: string;
    sort: number;
    parent: MenuParent | null;
    status: MenuStatus;
    level: number;
}
