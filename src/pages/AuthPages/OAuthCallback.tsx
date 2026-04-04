import PageMeta from "../../components/common/PageMeta.tsx";
import {getUrlParam} from "../../utils";
import {useAuthorization} from "../../hooks/authorization/useAuthorization.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useNavigate} from "react-router";
import foundationApi from "../../api/FoundationApi.ts";

/**
 * OAuth2 社交登录回调处理组件
 * 处理 GitHub、Google 等社交平台授权后，后端直接返回 token 的场景
 *
 * URL 格式：/oauth-callback?access_token=xxx&refresh_token=xxx&token_type=Bearer
 */
export default function OAuthCallback() {
    const {resetAuthorization} = useAuthorization();
    const navigate = useNavigate();

    useMountEffect(() => {
        (async () => {
            try {
                // 从 URL 中获取后端直接返回的 token
                const accessToken = getUrlParam('access_token');
                const refreshToken = getUrlParam('refresh_token');

                if (!accessToken) {
                    console.error("社交登录回调缺少 access_token 参数");
                    navigate('/', {replace: true});
                    return;
                }

                // 保存 token
                window.sessionStorage.setItem("USER_TOKEN", accessToken);
                if (refreshToken) {
                    window.sessionStorage.setItem("REFRESH_TOKEN", refreshToken);
                }

                // 获取当前用户信息并更新认证状态
                const user = await foundationApi.getCurrentUser();
                resetAuthorization(user);

                // 使用 setTimeout 确保状态已完全更新后再跳转
                setTimeout(() => {
                    navigate('/', {replace: true});
                }, 0);
            } catch (e: any) {
                console.error("社交登录回调处理失败:", e);
                navigate('/', {replace: true});
            }
        })();
    });

    return (
        <>
            <PageMeta
                title="登录授权中 | Orixa Admin"
                description="OAuth2 社交登录回调处理"
            />
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <svg className="h-6 w-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24"
                         aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">授权验证中，请稍候...</span>
                </div>
            </div>
        </>
    );
}
