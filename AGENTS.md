# AGENTS Guide

## 项目快照
- 技术栈：`React 19 + TypeScript + Vite 6 + Tailwind CSS 4`，入口在 `src/main.tsx`。
- 应用由全局 Provider 包裹：`ThemeProvider` + `AppWrapper(Helmet)` + `ModalProvider` + `MessageProvider`（见 `src/main.tsx`、`src/App.tsx`）。
- 路由集中在 `src/App.tsx`，页面组件基本采用 `lazy()` 懒加载，受保护页面挂在 `AppLayout` 下。

## 架构与边界（先看这些文件）
- API 分层：`src/api/NetworkRequester.ts` 提供两个 axios 实例；业务 API 按域拆分在 `AuthenticationApi.ts`、`FoundationApi.ts`、`SystemApi.ts`、`MonitorApi.ts`。
- 鉴权边界：`src/layout/AppLayout.tsx` 在渲染前检查 `USER_TOKEN` + `USER_AUTHORIZATION`，缺失即重定向 OAuth。
- 权限菜单边界：`src/layout/AppSidebar.tsx` 通过 `useCurrentStaff()` 读取员工菜单，生成侧边栏并做路由权限拦截（无权限跳 `/error-403`）。
- 全局状态方式：优先使用轻量 Context + 自定义 Hook，而非 Redux（`SidebarContext`、`ThemeContext`、`useAuthorization`）。

## 关键数据流（OAuth + 授权 + 菜单）
- 登录跳转：`AuthenticationApi.redirect()` 生成 PKCE（`code_verifier` 存 `sessionStorage`）并跳转授权端。
- 回调换 token：`src/pages/AuthPages/AuthorizeCodeCallback.tsx` 读取 `code` -> `AuthenticationApi.getToken()` -> 写入 `USER_TOKEN`。
- 拉取当前用户：回调页调用 `FoundationApi.getCurrentUser()`，结果写入 `useAuthorization`（底层 key：`USER_AUTHORIZATION`）。
- 拉取当前员工：`useCurrentStaff` 调 `SystemApi.getCurrentStaff()`，缓存到 `CURRENT_STAFF_CACHE`，`AppSidebar` 据此构建菜单。
- 401 统一处理：`requesterWithAuthenticationInstance` 响应拦截器会清理上述 3 个 key 并强制回到 `/`。

## 开发与调试工作流
- 安装与运行（以 `package.json` 为准）：`npm install`、`npm run dev`、`npm run build`、`npm run lint`、`npm run preview`。
- 实际开发端口由 `vite.config.ts` 控制为 `5173`；README 中 `3000` 仅作模板描述。
- 当前仓库无测试脚本与 `*.test/*spec` 文件；回归主要依赖 `npm run lint` + 关键页面手测。
- 调试鉴权问题时，优先检查 `sessionStorage` 的 `USER_TOKEN`、`USER_AUTHORIZATION`、`CURRENT_STAFF_CACHE`、`code_verifier`。

## 代码约定（项目特有）
- 导入普遍带 `.ts/.tsx` 扩展名（如 `import xx from "../api/SystemApi.ts"`），新增代码请保持一致。
- 页面初始化常用 `useMountEffect`（`src/hooks/useMountEffect.ts`）封装“仅首挂载执行一次”的逻辑。
- 页面元信息统一用 `PageMeta`（`src/components/common/PageMeta.tsx`）。
- 交互反馈优先用 `useMessage()` 和 `useModal()`（Promise 风格确认框），见 `src/pages/System/StaffList.tsx`。
- 菜单更新依赖 `SidebarContext.refreshMenu()` 触发 `menuRefreshKey`，不要直接操作侧边栏内部状态。

## 外部集成与环境变量
- 网关：`VITE_GATEWAY_URL`（`NetworkRequester.ts` 的 `baseURL`）。
- OAuth2/PKCE：`VITE_AUTH_SERVER_URL`、`VITE_CLIENT_ID`、`VITE_REDIRECT_URI`（`AuthenticationApi.ts`）。
- SVG 组件化由 `vite-plugin-svgr` 提供，配置在 `vite.config.ts`（`namedExport: ReactComponent`）。

## 已知实现风险（改动时留意）
- `AppLayout.tsx` 的登录回调地址写死为 `http://localhost:5173/authorize-code-callback`，与 `VITE_REDIRECT_URI` 可能不一致。
- `NetworkRequester.ts` 的 401 处理未判空 `error.response`，网络异常可能触发二次错误。
- `useMountEffect` 参数类型为 `any`，并依赖空依赖 `useEffect`；重构时注意闭包与时序行为。
