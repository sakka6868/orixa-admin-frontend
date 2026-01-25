import {BrowserRouter as Router, Route, Routes} from "react-router";
import MonitorDashboard from "./pages/Dashboard/MonitorDashboard";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/User/UserProfiles.tsx";
import Maintenance from "./pages/OtherPage/Maintenance";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero";
import FiveZeroThree from "./pages/OtherPage/FiveZeroThree";
import Forbidden from "./pages/OtherPage/Forbidden";

import ComingSoon from "./pages/OtherPage/ComingSoon";
import HomeWelcome from "./pages/OtherPage/HomeWelcome.tsx"; // 首页欢迎页面

import AppLayout from "./layout/AppLayout";

import {ScrollToTop} from "./components/common/ScrollToTop";
import ApiKeys from "./pages/OtherPage/ApiKeys";
import AuthorizeCodeCallback from "./pages/AuthPages/AuthorizeCodeCallback.tsx";
import TreeDemoPage from "./pages/OtherPage/TreeDemoPage";
import MenusList from "./pages/System/MenusList.tsx";
import StaffList from "./pages/System/StaffList.tsx";
import UserList from "./pages/Foundation/UserList.tsx";
import {MessageProvider} from "./components/ui/message";
import RoleList from "./pages/Foundation/RoleList.tsx";
import TenantList from "./pages/Foundation/TenantList.tsx";

export default function App() {
    return (
        <MessageProvider>
            <Router>
                <ScrollToTop/>
                <Routes>
                    {/* Dashboard Layout */}
                    <Route element={<AppLayout/>}>
                        <Route path="/" element={<HomeWelcome/>}/>
                        <Route path="/welcome" element={<HomeWelcome/>}/>
                        <Route path="/analytics/monitor" element={<MonitorDashboard/>}/>
                        <Route path="/system" element={<MenusList/>}/>
                        <Route path="/system/menus" element={<MenusList/>}/>
                        <Route path="/system/staffs" element={<StaffList/>}/>
                        <Route path="/foundation/users" element={<UserList/>}/>
                        <Route path="/foundation/roles" element={<RoleList/>}/>
                        <Route path="/foundation/tenants" element={<TenantList/>}/>
                        {/* Others Page */}
                        <Route path="/user/profile" element={<UserProfiles/>}/>
                        <Route path="/api-keys" element={<ApiKeys/>}/>
                        <Route path="/tree-demo" element={<TreeDemoPage/>}/>
                    </Route>
                    {/* Auth Pages */}
                    <Route path="/authorize-code-callback" element={<AuthorizeCodeCallback/>}/>

                    {/* Fallback Route */}
                    <Route path="*" element={<NotFound/>}/>
                    <Route path="/maintenance" element={<Maintenance/>}/>
                    <Route path="/error-500" element={<FiveZeroZero/>}/>
                    <Route path="/error-503" element={<FiveZeroThree/>}/>
                    <Route path="/error-403" element={<Forbidden/>}/>
                    <Route path="/coming-soon" element={<ComingSoon/>}/>
                    <Route path="/welcome" element={<HomeWelcome/>}/>
                </Routes>
            </Router>
        </MessageProvider>
    );
}