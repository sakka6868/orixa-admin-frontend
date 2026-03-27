import { Link } from "react-router";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";

export default function FiveZeroThree() {
  return (
    <>
      <PageMeta
        title="503 - 服务不可用 | Orixa Admin"
        description="服务暂时不可用，请稍后重试"
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />

        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[492px]">
          <h1 className="mb-8 bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent font-bold text-title-md xl:text-title-2xl">
            503
          </h1>

          <img src="/images/error/503.svg" alt="服务不可用" className="dark:hidden" loading="lazy" />
          <img
            src="/images/error/503-dark.svg"
            alt="服务不可用"
            className="hidden dark:block"
            loading="lazy"
          />

          <p className="mt-10 mb-6 text-base app-text-secondary sm:text-lg">
            服务暂时不可用，我们正在努力修复。请稍后再试。
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
    </>
  );
}
