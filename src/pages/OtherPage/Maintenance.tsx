import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function Maintenance() {
  return (
    <>
      <PageMeta
        title="系统维护中 | Orixa Admin"
        description="系统正在维护，请稍后访问"
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />

        <div>
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[555px]">
            <div className="mx-auto mb-10 w-full max-w-[155px] text-center sm:max-w-[204px]">
              <img
                src="/images/error/maintenance.svg"
                alt="系统维护"
                className="dark:hidden"
                loading="lazy"
              />
              <img
                src="/images/error/maintenance-dark.svg"
                alt="系统维护"
                className="hidden dark:block"
                loading="lazy"
              />
            </div>

            <h1 className="mb-2 bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent font-bold text-title-md xl:text-title-2xl">
              系统维护
            </h1>

            <p className="mt-6 mb-6 text-base app-text-secondary sm:text-lg">
              系统正在进行例行维护，即将恢复正常访问。感谢您的耐心等待。
            </p>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-colors"
            >
              返回首页
            </Link>
          </div>
          <p className="absolute text-sm text-center app-text-muted -translate-x-1/2 bottom-6 left-1/2">
            &copy; {new Date().getFullYear()} - Orixa Admin
          </p>
        </div>
      </div>
    </>
  );
}
