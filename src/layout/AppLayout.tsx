import {SidebarProvider, useSidebar} from "../context/SidebarContext";
import {Outlet} from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import {useAuthorization} from "../hooks/authorization/useAuthorization.ts";
import AuthenticationApi from "../api/AuthenticationApi.ts";
import React, {useEffect, useRef} from "react";


const redirectUri = import.meta.env.VITE_REDIRECT_URI;

const LayoutContent: React.FC = () => {
    const {isExpanded, isHovered, isMobileOpen} = useSidebar();

    return (
        <div className="app-shell min-h-screen xl:flex">
            <AppSidebar/>
            <Backdrop/>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered ? "xl:ml-[290px]" : "xl:ml-[90px]"
                } ${isMobileOpen ? "ml-0" : ""}`}
            >
                <AppHeader/>
                <div className="mx-auto w-full max-w-(--breakpoint-3xl) p-5 md:p-7">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
};

const AppLayout: React.FC = () => {
    const {authorization} = useAuthorization();
    const userToken = window.sessionStorage.getItem("USER_TOKEN");
    const isRedirecting = useRef(false);
    const isAuthenticated = !!(authorization && userToken);

    useEffect(() => {
        if (!isAuthenticated && !isRedirecting.current) {
            isRedirecting.current = true;
            AuthenticationApi.redirect(redirectUri).then(() => {
                console.log('redirecting to login');
            }).catch((err) => {
                console.error('redirect failed', err);
                isRedirecting.current = false;
            });
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <></>;
    }

    return (
        <SidebarProvider>
            <LayoutContent/>
        </SidebarProvider>
    );
};

export default AppLayout;
