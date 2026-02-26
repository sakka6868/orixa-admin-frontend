import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {MenuVo} from "../../types/staff";
import {MenuType} from "../../types/menu";
import {useAuthorization} from "../../hooks/authorization/useAuthorization";
import { useCurrentStaff } from "../../hooks/useCurrentStaff";

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
    const {authorization} = useAuthorization();
    const [loading, setLoading] = useState(false);
    const [firstMenuPath, setFirstMenuPath] = useState<string | null>(null);
    const { staff, loading: staffLoading } = useCurrentStaff();

    // 获取第一个可用的菜单路径
    useEffect(() => {
        if (!authorization || staffLoading) {
            return;
        }

        if (staff && staff.menus && staff.menus.length > 0) {
            const path = findFirstMenuPath(staff.menus);
            setFirstMenuPath(path);
            return;
        }

        setFirstMenuPath(null);
    }, [authorization, staff, staffLoading]);

    // 进入控制台点击处理
    const handleEnterConsole = () => {
        if (staffLoading) {
            return;
        }
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
            <div className="home-welcome-scene home-welcome-bleed relative z-1 flex w-full flex-col items-center justify-center overflow-hidden p-6">
                <div className="home-welcome-grid">
                    <GridShape />
                </div>
                <div className="home-welcome-orb home-welcome-orb--one"></div>
                <div className="home-welcome-orb home-welcome-orb--two"></div>
                <div className="home-welcome-stars">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className="home-welcome-card app-surface app-border mx-auto w-full max-w-[600px] rounded-2xl border px-6 py-10 text-center shadow-theme-lg sm:px-10">
                    <div className="home-welcome-rune"></div>
                    {/* 雨滴涟漪效果 */}
                    <div className="home-welcome-raindrops">
                        <div className="home-welcome-raindrop"></div>
                        <div className="home-welcome-raindrop"></div>
                        <div className="home-welcome-raindrop"></div>
                        <div className="home-welcome-raindrop"></div>
                        <div className="home-welcome-raindrop"></div>
                        <div className="home-welcome-raindrop"></div>
                    </div>
                    {/* Logo */}
                    <div className="mb-8">
                        <img
                            className="home-welcome-logo mx-auto h-12 dark:hidden asuka:hidden"
                            src="images/logo/logo.svg"
                            alt="Logo"
                        />
                        <img
                            className="home-welcome-logo mx-auto h-12 hidden dark:block asuka:hidden"
                            src="images/logo/logo-dark.svg"
                            alt="Logo"
                        />
                        <img
                            className="home-welcome-logo mx-auto h-24 hidden asuka:block asuka-logo"
                            src="images/asuka-portrait.jpg"
                            alt="Asuka"
                        />
                    </div>

                    {/* 欢迎标题 */}
                    <h1 className="home-welcome-title app-text-primary mb-4 text-3xl font-bold xl:text-4xl">
                        欢迎使用 Orixa Admin
                    </h1>
                    <p className="app-text-muted mb-10 text-base">
                        一站式管理后台解决方案，助您高效管理业务
                    </p>

                    {/* 开始使用按钮 */}
                    <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            onClick={handleEnterConsole}
                            disabled={loading || staffLoading}
                            className="home-welcome-button app-button-accent group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                <svg className="home-welcome-arrow fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.33301 10H16.6663M16.6663 10L11.6663 5M16.6663 10L11.6663 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                            进入控制台
                        </button>
                        <Link
                            to="/api-keys"
                            className="app-surface-soft app-border app-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3.5 text-sm font-medium transition-colors"
                        >
                            查看文档
                        </Link>
                    </div>
                </div>

                {/* 页脚 */}
                <p className="app-text-muted absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm">
                    &copy; {new Date().getFullYear()} - Orixa Admin
                </p>
            </div>
        </>
    );
}