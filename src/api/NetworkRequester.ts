import axios, {AxiosResponse, CreateAxiosDefaults} from "axios";


const BASE_URL = import.meta.env.VITE_GATEWAY_URL;

const baseConfig: CreateAxiosDefaults = {
    baseURL: BASE_URL,
    timeout: -1
};
const requesterInstance = axios.create(baseConfig);

const requesterWithAuthenticationInstance = axios.create(baseConfig);

// 响应拦截器
const onFulfilled = (response: AxiosResponse) => response.data;
// 请求失败
requesterInstance.interceptors.response.use(onFulfilled, error => Promise.reject(error));

// 请求拦截器
requesterWithAuthenticationInstance.interceptors.request.use(config => {
    // 添加token
    config.headers.Authorization = `Bearer ${window.sessionStorage.getItem("USER_TOKEN")}`;
    return config;
});

// 响应拦截器
requesterWithAuthenticationInstance.interceptors.response.use(onFulfilled, error => {
    // 处理token失效
    if (error.response.status === 401) {
        window.sessionStorage.removeItem("USER_TOKEN");
        window.sessionStorage.removeItem("USER_AUTHORIZATION");
        window.sessionStorage.removeItem("CURRENT_STAFF_CACHE");
        window.location.href = "/";
    }
    return Promise.reject(error);
})

export {
    requesterInstance,
    requesterWithAuthenticationInstance
}