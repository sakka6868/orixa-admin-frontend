import {BrowserRouter as Router, Route, Routes} from "react-router";
import Analytics from "./pages/Dashboard/Analytics";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/User/UserProfiles.tsx";
import Maintenance from "./pages/OtherPage/Maintenance";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero";
import FiveZeroThree from "./pages/OtherPage/FiveZeroThree";

import ComingSoon from "./pages/OtherPage/ComingSoon";

import AppLayout from "./layout/AppLayout";

import {ScrollToTop} from "./components/common/ScrollToTop";
import ApiKeys from "./pages/OtherPage/ApiKeys";
import AuthorizeCodeCallback from "./pages/AuthPages/AuthorizeCodeCallback.tsx";
import TreeDemoPage from "./pages/OtherPage/TreeDemoPage";

export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop/>
                <Routes>
                    {/* Dashboard Layout */}
                    <Route element={<AppLayout/>}>
                        <Route index path="/" element={<Analytics/>}/>
                        <Route path="/analytics" element={<Analytics/>}/>
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
                    <Route path="/coming-soon" element={<ComingSoon/>}/>
                </Routes>
            </Router>
        </>
    );
}