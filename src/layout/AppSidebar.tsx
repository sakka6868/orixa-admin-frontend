import React, {useCallback, useEffect, useRef, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router";

// Assume these icons are imported from an icon library
import {ChevronDownIcon, DocsIcon, GridIcon, HomeIcon, HorizontaLDots, TableIcon, UserIcon,} from "../icons";
import {useSidebar} from "../context/SidebarContext";
import SystemApi from "../api/SystemApi";
import {MenuVo} from "../types/staff";
import useMountEffect from "../hooks/useMountEffect";
import {useAuthorization} from "../hooks/authorization/useAuthorization";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    new?: boolean;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const IconMappings: Record<string, React.ReactNode> = {
    GridIcon: <GridIcon/>,
    UserIcon: <UserIcon/>,
    TableIcon: <TableIcon/>,
    HomeIcon: <HomeIcon/>,
    DocsIcon: <DocsIcon/>,
};

// 固定的首页菜单（无需权限）
const homeMenuItem: NavItem = {
    name: "首页",
    icon: <HomeIcon/>,
    path: "/welcome",
};

// 将菜单数据转换为 NavItem 格式
const convertMenusToNavItems = (menus: MenuVo[]): NavItem[] => {
    return menus.map(menu => {
        const navItem: NavItem = {
            name: menu.name,
            icon: IconMappings[menu.icon || 'GridIcon'] || <GridIcon/>,
            path: menu.path || undefined,
        };
        
        // 如果有子菜单，转换为 subItems
        if (menu.children && menu.children.length > 0) {
            navItem.subItems = menu.children.map(child => ({
                name: child.name,
                path: child.path || '',
            }));
            // 有子菜单时，父级不需要 path
            navItem.path = undefined;
        }
        
        return navItem;
    });
};

// 递归获取所有菜单路径
const getAllMenuPaths = (menus: MenuVo[]): string[] => {
    let paths: string[] = [];
    menus.forEach(menu => {
        if (menu.path) {
            paths.push(menu.path);
        }
        if (menu.children && menu.children.length > 0) {
            paths = paths.concat(getAllMenuPaths(menu.children));
        }
    });
    return paths;
};

// 检查路径是否有权限
const hasPathPermission = (currentPath: string, allowedPaths: string[]): boolean => {
    // 首页和欢迎页始终允许访问（无需权限）
    if (currentPath === '/' || currentPath === '' || currentPath === '/welcome') {
        return true;
    }
    // 检查当前路径是否在允许的路径列表中
    return allowedPaths.some(path => {
        if (!path) return false;
        // 精确匹配或前缀匹配（用于子路由）
        return currentPath === path || currentPath.startsWith(path + '/');
    });
};


const AppSidebar: React.FC = () => {
    const {isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen, menuRefreshKey} =
        useSidebar();
    const location = useLocation();
    const navigate = useNavigate();
    const {authorization} = useAuthorization();
    
    // 动态菜单数据
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
    const prevMenuRefreshKey = useRef(menuRefreshKey);
    
    // 获取菜单的公共方法
    const fetchCurrentStaffMenus = useCallback(async () => {
        // 如果已经在错误页面，不再获取菜单
        if (location.pathname.startsWith('/error-')) {
            setMenuLoading(false);
            return;
        }

        if (!authorization) {
            setMenuLoading(false);
            return;
        }
        
        setMenuLoading(true);
        try {
            const staff = await SystemApi.getCurrentStaff();
            if (staff && staff.menus && staff.menus.length > 0) {
                const items = convertMenusToNavItems(staff.menus);
                // 在菜单最前面添加固定的首页菜单
                setNavItems([homeMenuItem, ...items]);
                // 保存允许的路径列表
                setAllowedPaths(getAllMenuPaths(staff.menus));
            } else {
                // 没有菜单权限，跳转403页面
                navigate('/error-403');
            }
        } catch (error) {
            console.error('获取当前员工菜单失败:', error);
            // 获取失败也跳转403页面
            navigate('/error-403');
        } finally {
            setMenuLoading(false);
        }
    }, [navigate, location.pathname, authorization]);
    
    // 组件挂载时获取菜单（只执行一次）
    useMountEffect(() => {
        fetchCurrentStaffMenus().then(()=>console.log('监控服务数据加载完成'));
    });
    
    // 监听 menuRefreshKey 变化时刷新菜单（跳过首次渲染）
    useEffect(() => {
        if (prevMenuRefreshKey.current !== menuRefreshKey) {
            prevMenuRefreshKey.current = menuRefreshKey;
            fetchCurrentStaffMenus().then(()=>console.log('监控服务数据加载完成'));
        }
    }, [menuRefreshKey, fetchCurrentStaffMenus]);
    
    // 路由变化时检查权限（使用已获取的菜单数据）
    useEffect(() => {
        // 跳过错误页面和加载中的情况
        if (location.pathname.startsWith('/error-') || menuLoading) {
            return;
        }
        // 如果菜单已加载，检查当前路径是否有权限
        if (allowedPaths.length > 0 && !hasPathPermission(location.pathname, allowedPaths)) {
            navigate('/error-403');
        }
    }, [location.pathname, allowedPaths, menuLoading, navigate]);
    
    // Auto-close sidebar on mobile after route change
    useEffect(() => {
        if (isMobileOpen) {
            setIsMobileOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: "system" | "support" | "others";
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {}
    );
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // const isActive = (path: string) => location.pathname === path;
    const isActive = useCallback(
        (path: string) => location.pathname === path,
        [location.pathname]
    );

    useEffect(() => {
        let submenuMatched = false;
        ["system", "support", "others"].forEach((menuType) => {
            const items =
                menuType === "system"
                    ? navItems
                    : menuType === "support"
                        ? []
                        : [];
            items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: menuType as "system" | "support" | "others",
                                index,
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [location, isActive, navItems]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (
        index: number,
        menuType: "system" | "support" | "others"
    ) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return {type: menuType, index};
        });
    };

    const renderMenuItems = (
        items: NavItem[],
        menuType: "system" | "support" | "others"
    ) => (
        <ul className="flex flex-col gap-1">
            {items.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`menu-item group ${
                                openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? "menu-item-active"
                                    : "menu-item-inactive"
                            } cursor-pointer ${
                                !isExpanded && !isHovered
                                    ? "xl:justify-center"
                                    : "xl:justify-start"
                            }`}
                        >
              <span
                  className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>

                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{nav.name}</span>
                            )}
                            {nav.new && (isExpanded || isHovered || isMobileOpen) && (
                                <span
                                    className={`ml-auto absolute right-10 ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? "menu-dropdown-badge-active"
                                            : "menu-dropdown-badge-inactive"
                                    } menu-dropdown-badge`}
                                >
                  new
                </span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDownIcon
                                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? "rotate-180 text-brand-500"
                                            : ""
                                    }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                to={nav.path}
                                className={`menu-item group ${
                                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                                }`}
                            >
                <span
                    className={`menu-item-icon-size ${
                        isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                            ref={(el) => {
                                subMenuRefs.current[`${menuType}-${index}`] = el;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                height:
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                        : "0px",
                            }}
                        >
                            <ul className="mt-2 space-y-1 ml-9">
                                {nav.subItems.map((subItem) => (
                                    <li key={subItem.name}>
                                        <Link
                                            to={subItem.path}
                                            className={`menu-dropdown-item ${
                                                isActive(subItem.path)
                                                    ? "menu-dropdown-item-active"
                                                    : "menu-dropdown-item-inactive"
                                            }`}
                                        >
                                            {subItem.name}
                                            <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                            <span
                                className={`ml-auto ${
                                    isActive(subItem.path)
                                        ? "menu-dropdown-badge-active"
                                        : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                            new
                          </span>
                        )}
                                                {subItem.pro && (
                                                    <span
                                                        className={`ml-auto ${
                                                            isActive(subItem.path)
                                                                ? "menu-dropdown-badge-pro-active"
                                                                : "menu-dropdown-badge-pro-inactive"
                                                        } menu-dropdown-badge-pro`}
                                                    >
                            pro
                          </span>
                                                )}
                      </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`app-sidebar fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900
        ${
                isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                        ? "w-[290px]"
                        : "w-[90px]"
            }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`py-8  flex ${
                    !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
                }`}
            >
                <Link to="/">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <img
                                className="dark:hidden asuka:hidden"
                                src="/images/logo/logo.svg"
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                            <img
                                className="hidden dark:block asuka:hidden"
                                src="/images/logo/logo-dark.svg"
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                            <img
                                className="hidden asuka:block asuka-logo"
                                src="/images/asuka-portrait.jpg"
                                alt="Asuka"
                                width={150}
                                height={150}
                            />
                        </>
                    ) : (
                        <img
                            className="asuka:hidden"
                            src="/images/logo/logo-icon.svg"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`app-text-muted mb-4 flex text-xs leading-[20px] uppercase text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "xl:justify-center"
                                        : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "菜单"
                                ) : (
                                    <HorizontaLDots className="size-6"/>
                                )}
                            </h2>
                            {menuLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"></div>
                                    {(isExpanded || isHovered || isMobileOpen) && (
                                        <span className="app-text-muted ml-2 text-sm text-gray-400">加载中...</span>
                                    )}
                                </div>
                            ) : (
                                renderMenuItems(navItems, "system")
                            )}
                        </div>
                    </div>
                </nav>
            </div>
            {/* EVA Unit-02 Background */}
            <div className="asuka-unit02-bg"></div>
        </aside>
    );
};

export default AppSidebar;