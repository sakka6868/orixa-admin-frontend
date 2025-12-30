import RecentOrderAnalytics from "../../components/analytics/RecentOrderAnalytics";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import TopPages from "../../components/analytics/TopPages";
import TopChannel from "../../components/analytics/TopChannel";
import AnalyticsMetrics from "../../components/analytics/AnalyticsMetrics";
import ActiveUsersChart from "../../components/analytics/ActiveUsersChart";
import AnalyticsBarChart from "../../components/analytics/AnalyticsBarChart";
import AcquisitionChannelChart from "../../components/analytics/AcquisitionChannelChart";
import SessionChart from "../../components/analytics/SessionChart";
import PageMeta from "../../components/common/PageMeta";

export default function Analytics() {
  return (
    <>
      <PageMeta
        title="分析仪表盘 | OrixaAdmin - React.js 管理仪表盘"
        description="这是基于 React.js 的 OrixaAdmin 分析仪表盘页面 - React.js Tailwind CSS 管理仪表盘"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <AnalyticsMetrics />
        </div>
        <div className="col-span-12">
          <AnalyticsBarChart />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TopChannel />
            <TopPages />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <ActiveUsersChart />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <AcquisitionChannelChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <SessionChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrderAnalytics />
        </div>
      </div>
    </>
  );
}
