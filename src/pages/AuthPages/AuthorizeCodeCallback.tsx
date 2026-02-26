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
                title="Dashboard |  Orixa Admin - React.js Admin Dashboard"
                description="This is React.js Two Step Verification Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <div>
                Loading...
            </div>
        </>
    );
}