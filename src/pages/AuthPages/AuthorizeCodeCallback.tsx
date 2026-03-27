import AuthenticationApi from "../../api/AuthenticationApi.ts";
import PageMeta from "../../components/common/PageMeta.tsx";
import {getUrlParam} from "../../utils";
import {useAuthorization} from "../../hooks/authorization/useAuthorization.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useNavigate} from "react-router";
import foundationApi from "../../api/FoundationApi.ts";


export default function AuthorizeCodeCallback() {
    const {resetAuthorization} = useAuthorization();
    const navigate = useNavigate();
    useMountEffect(() => {
        // 从url中获取code
        //匿名函数
        (async () => {
            const code = getUrlParam('code') as string;
            // 获取token
            const response: any = await AuthenticationApi.getToken(code);
            // 保存token
            window.sessionStorage.setItem("USER_TOKEN", response.access_token);
            try {
               const user = await foundationApi.getCurrentUser();
                resetAuthorization(user);
                // 使用 setTimeout 确保状态已完全更新后再跳转
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 0);
            } catch (e: any) {
                console.log("Error:",e);
            }
        })();
    });
    return (
        <>
            <PageMeta
                title="登录授权中 | Orixa Admin"
                description="OAuth2 授权码回调处理"
            />
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <svg className="h-6 w-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">授权验证中，请稍候...</span>
                </div>
            </div>
        </>
    );
}