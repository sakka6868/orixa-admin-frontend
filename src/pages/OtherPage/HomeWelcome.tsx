import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import {Link, useNavigate} from "react-router";
import {useState} from "react";
import SystemApi from "../../api/SystemApi";
import {MenuVo} from "../../types/staff";
import {MenuType} from "../../types/menu";
import useMountEffect from "../../hooks/useMountEffect.ts";

// 递归查找第一个 type="MENU" 的菜单路径
const findFirstMenuPath = (menus: MenuVo[]): string | null => {
    for (const menu of menus) {
        // 只查找 type="MENU" 的菜单项
        if (menu.type === MenuType.MENU && menu.path) {
            return menu.path;
        }
        if (menu.children && menu.children.length > 0) {
            const childPath = findFirstMenuPath(menu.children);
            if (childPath) {
                return childPath;
            }
        }
    }
    return null;
};

export default function HomeWelcome() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [firstMenuPath, setFirstMenuPath] = useState<string | null>(null);
    
    // 获取第一个可用的菜单路径
    useMountEffect(() => {
        const fetchMenus = async () => {
            try {
                const staff = await SystemApi.getCurrentStaff();
                if (staff && staff.menus && staff.menus.length > 0) {
                    const path = findFirstMenuPath(staff.menus);
                    setFirstMenuPath(path);
                }
            } catch (error) {
                console.error('获取菜单失败:', error);
            }
        };
        fetchMenus().then(() => console.log('菜单加载完成'));
    });
    
    // 进入控制台点击处理
    const handleEnterConsole = () => {
        setLoading(true);
        if (firstMenuPath) {
            navigate(firstMenuPath);
        } else {
            navigate('/error-403');
        }
    };
    return (
        <>
            <PageMeta
                title="欢迎 | Orixa Admin"
                description="欢迎使用 Orixa Admin 管理系统"
            />
            <div className="relative flex flex-col items-center justify-center w-full min-h-screen p-6 overflow-hidden z-1">
                <GridShape />

                <div className="mx-auto w-full max-w-[600px] text-center">
                    {/* Logo */}
                    <div className="mb-8">
                        <img
                            className="mx-auto h-12 dark:hidden asuka:hidden"
                            src="images/logo/logo.svg"
                            alt="Logo"
                        />
                        <img
                            className="mx-auto h-12 hidden dark:block"
                            src="images/logo/logo-dark.svg"
                            alt="Logo"
                        />
                        <img
                            className="mx-auto h-12 hidden asuka:block"
                            src="images/logo/logo-dark.svg"
                            alt="Logo"
                        />
                    </div>

                    {/* 欢迎标题 */}
                    <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white/90 xl:text-4xl">
                        欢迎使用 Orixa Admin
                    </h1>
                    <p className="text-base text-gray-500 mb-10 dark:text-gray-400">
                        一站式管理后台解决方案，助您高效管理业务
                    </p>

                    {/* 开始使用按钮 */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <button
                            onClick={handleEnterConsole}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.33301 10H16.6663M16.6663 10L11.6663 5M16.6663 10L11.6663 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                            进入控制台
                        </button>
                        <Link
                            to="/api-keys"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            查看文档
                        </Link>
                    </div>
                </div>

                {/* 页脚 */}
                <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} - Orixa Admin
                </p>
            </div>
        </>
    );
}
