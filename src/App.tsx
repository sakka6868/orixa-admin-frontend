import {BrowserRouter as Router, Route, Routes} from "react-router";
import { Suspense, lazy } from "react";

// 布局组件（立即加载）
import AppLayout from "./layout/AppLayout";
import {ScrollToTop} from "./components/common/ScrollToTop";
import {MessageProvider} from "./components/ui/message";
import {ModalProvider} from "./components/ui/modal";

// 页面组件（懒加载）
const MonitorDashboard = lazy(() => import("./pages/Analytics/MonitorDashboard.tsx"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const Maintenance = lazy(() => import("./pages/OtherPage/Maintenance"));
const FiveZeroZero = lazy(() => import("./pages/OtherPage/FiveZeroZero"));
const FiveZeroThree = lazy(() => import("./pages/OtherPage/FiveZeroThree"));
const Forbidden = lazy(() => import("./pages/OtherPage/Forbidden"));
const ComingSoon = lazy(() => import("./pages/OtherPage/ComingSoon"));
const HomeWelcome = lazy(() => import("./pages/OtherPage/HomeWelcome.tsx"));
const ApiKeys = lazy(() => import("./pages/OtherPage/ApiKeys"));
const AuthorizeCodeCallback = lazy(() => import("./pages/AuthPages/AuthorizeCodeCallback.tsx"));
const OAuthCallback = lazy(() => import("./pages/AuthPages/OAuthCallback.tsx"));
const MenusList = lazy(() => import("./pages/System/MenusList.tsx"));
const StaffList = lazy(() => import("./pages/System/StaffList.tsx"));
const UserList = lazy(() => import("./pages/Foundation/UserList.tsx"));
const RoleList = lazy(() => import("./pages/Foundation/RoleList.tsx"));
const TenantList = lazy(() => import("./pages/Foundation/TenantList.tsx"));
const LoginLogList = lazy(() => import("./pages/Authorization/LoginLogList.tsx"));
const AnnouncementList = lazy(() => import("./pages/Foundation/AnnouncementList.tsx"));
const OperationLogList = lazy(() => import("./pages/Foundation/OperationLogList.tsx"));
const MessageList = lazy(() => import("./pages/Foundation/MessageList.tsx"));
const EmailLogList = lazy(() => import("./pages/Foundation/EmailLogList.tsx"));
const SystemConfigList = lazy(() => import("./pages/Foundation/SystemConfigList.tsx"));
const FileStorageList = lazy(() => import("./pages/Foundation/FileStorageList.tsx"));
const ApiStatistics = lazy(() => import("./pages/Analytics/ApiStatistics.tsx"));

// 页面加载占位组件
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      <p className="text-sm text-gray-500 dark:text-gray-400">页面加载中...</p>
    </div>
  </div>
);

export default function App() {
    return (
        <ModalProvider>
            <MessageProvider>
                <Router>
                    <ScrollToTop/>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Dashboard Layout */}
                            <Route element={<AppLayout/>}>
                                <Route path="/" element={<HomeWelcome/>}/>
                                <Route path="/welcome" element={<HomeWelcome/>}/>
                                <Route path="/analytics/monitor" element={<MonitorDashboard/>}/>
                                <Route path="/analytics/api-statistics" element={<ApiStatistics/>}/>
                                <Route path="/system/menus" element={<MenusList/>}/>
                                <Route path="/system/staffs" element={<StaffList/>}/>
                                <Route path="/foundation/users" element={<UserList/>}/>
                                <Route path="/foundation/roles" element={<RoleList/>}/>
                                <Route path="/foundation/tenants" element={<TenantList/>}/>
                                <Route path="/authorization/login-logs" element={<LoginLogList/>}/>
                                <Route path="/foundation/announcements" element={<AnnouncementList/>}/>
                                <Route path="/foundation/operation-logs" element={<OperationLogList/>}/>
                                <Route path="/foundation/messages" element={<MessageList/>}/>
                                <Route path="/foundation/email-logs" element={<EmailLogList/>}/>
                                <Route path="/foundation/system-configs" element={<SystemConfigList/>}/>
                                <Route path="/foundation/file-storage" element={<FileStorageList/>}/>
                                {/* Others Page */}
                                <Route path="/api-keys" element={<ApiKeys/>}/>
                            </Route>
                            {/* Auth Pages */}
                            <Route path="/authorize-code-callback" element={<AuthorizeCodeCallback/>}/>
                            <Route path="/oauth-callback" element={<OAuthCallback/>}/>
                            {/* Fallback Route */}
                            <Route path="/maintenance" element={<Maintenance/>}/>
                            <Route path="/error-500" element={<FiveZeroZero/>}/>
                            <Route path="/error-503" element={<FiveZeroThree/>}/>
                            <Route path="/error-403" element={<Forbidden/>}/>
                            <Route path="/coming-soon" element={<ComingSoon/>}/>
                            <Route path="*" element={<NotFound/>}/>
                        </Routes>
                    </Suspense>
                </Router>
            </MessageProvider>
        </ModalProvider>
    );
}