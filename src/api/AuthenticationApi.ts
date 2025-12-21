import {requesterInstance} from './NetworkRequester.ts'

const generatePKCE = async (): Promise<{ codeChallenge: string, codeVerifier: string }> => {
    // 生成一个随机字符串作为 code verifier
    const codeVerifier = generateRandomString(128);

    // 将 code verifier 进行 SHA-256 哈希
    const codeChallenge = await sha256(codeVerifier);

    return {
        codeChallenge: base64UrlEncode(codeChallenge),
        codeVerifier
    };
}

// 用于生成随机字符串
function generateRandomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 用于计算 SHA-256 哈希
function sha256(str: string) {
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(str));
}

// 用于将二进制数据进行 Base64 URL 编码
function base64UrlEncode(buffer: ArrayBuffer) {
    const base64 = bufferToBase64(buffer);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 将二进制数据转换为 Base64 字符串
function bufferToBase64(buffer: ArrayBuffer) {
    // @ts-ignore
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return window.btoa(binary);
}

// 从环境变量获取配置
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || "pkcepublic";
const AUTH_SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:9000";
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173/authorize-code-callback";

const AuthenticationApi = {
    redirect: async (callback: string) => {
        // 示例：发起授权请求
        const {codeChallenge, codeVerifier} = await generatePKCE();
        sessionStorage.setItem('code_verifier', codeVerifier);
        // 重定向到授权服务器进行授权
        window.location.href = `${AUTH_SERVER_URL}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${callback}&scope=profile&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    },
    getToken: async (code: string) => {
        const codeVerifier = sessionStorage.getItem('code_verifier');
        return await requesterInstance.post(`${AUTH_SERVER_URL}/oauth2/token`, {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            code_verifier: codeVerifier,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
    }
}

export default AuthenticationApi;