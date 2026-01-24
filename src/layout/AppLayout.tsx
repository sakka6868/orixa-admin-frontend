import {SidebarProvider, useSidebar} from "../context/SidebarContext";
import {Outlet} from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import {useAuthorization} from "../hooks/authorization/useAuthorization.ts";
import AuthenticationApi from "../api/AuthenticationApi.ts";
import React from "react";

const LayoutContent: React.FC = () => {
    const {isExpanded, isHovered, isMobileOpen} = useSidebar();

    return (
        <div className="min-h-screen xl:flex">
            <AppSidebar/>
            <Backdrop/>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered ? "xl:ml-[290px]" : "xl:ml-[90px]"
                } ${isMobileOpen ? "ml-0" : ""}`}
            >
                <AppHeader/>
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
};

const AppLayout: React.FC = () => {
    //获取当前路由
    const {authorization} = useAuthorization();
    const userToken = window.sessionStorage.getItem("USER_TOKEN");
    if (!authorization || !userToken) {
        AuthenticationApi.redirect('http://localhost:5173/authorize-code-callback').then(() => console.log('redirecting to login'));
        return <></>;
    }
    return (
        <SidebarProvider>
            <LayoutContent/>
        </SidebarProvider>
    );
};

export default AppLayout;
