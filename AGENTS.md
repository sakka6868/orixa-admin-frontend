# AGENTS 指南（orixa-admin-frontend）

## 1) 项目主干与数据流
- 入口在 `src/main.tsx`：`ThemeProvider -> AppWrapper(HelmetProvider) -> App`，页面元信息统一走 `PageMeta`。
- 路由在 `src/App.tsx`：业务页懒加载，受保护页面统一挂在 `AppLayout` 下；`/authorize-code-callback` 是 OAuth 回调入口。
- 认证闭环：`AppLayout` 检查 `USER_TOKEN` + `USER_AUTHORIZATION`，缺失即触发 `AuthenticationApi.redirect(...)`。
- 回调页 `src/pages/AuthPages/AuthorizeCodeCallback.tsx`：用 code 换 token，写入 `sessionStorage.USER_TOKEN`，再拉取 `FoundationApi.getCurrentUser()` 并写入 `useAuthorization`。
- API 分层在 `src/api/*`：`NetworkRequester.ts` 提供匿名/鉴权 axios 实例，响应拦截器直接返回 `response.data`（调用方拿到的是业务体，不是 AxiosResponse）。

## 2) 本地开发与验证命令
- 安装：`npm install`（仓库也声明 `yarn@1.22`，可二选一，但建议团队内统一）。
- 开发：`npm run dev`（Vite 默认 `5173`，见 `vite.config.ts`）。
- 构建：`npm run build`（先 `tsc -b` 再 `vite build`）。
- Lint：`npm run lint`（当前无测试脚本，提交前至少跑 lint + build）。

## 3) 环境变量与外部集成
- 实际使用的变量：`VITE_GATEWAY_URL`、`VITE_CLIENT_ID`、`VITE_AUTH_SERVER_URL`、`VITE_REDIRECT_URI`（见 `src/api/NetworkRequester.ts`、`src/api/AuthenticationApi.ts`）。
- `.env.example` 仅包含 OAuth 相关 3 项，缺少 `VITE_GATEWAY_URL`；新环境务必补齐。
- 认证采用 OAuth2 PKCE：`AuthenticationApi.generatePKCE -> /oauth2/authorize -> /oauth2/token`。
- 401 统一处理在 `NetworkRequester.ts`：清空 `USER_TOKEN`/`USER_AUTHORIZATION`/`CURRENT_STAFF_CACHE` 并跳回 `/`。

## 4) 项目内约定（与常见模板不同）
- TypeScript 开启 `strict`，且 `allowImportingTsExtensions=true`；项目广泛使用显式扩展名导入（如 `import x from "./a.ts"`），新增文件请保持一致。
- 路由库从 `react-router` 导入（不是 `react-router-dom`），新增路由代码遵循现有写法。
- 一次性首屏请求常用 `useMountEffect`（`src/hooks/useMountEffect.ts`），避免把初始化请求写成依赖复杂的 `useEffect`。
- 交互反馈优先使用全局上下文：`useMessage()`（轻提示）与 `useModal()`（确认/告警），参考 `src/pages/System/StaffList.tsx`。
- 样式以 Tailwind 为主，动态类名拼接用 `cn()`（`src/utils/index.ts`）。

## 5) 权限与菜单机制（改动高风险区）
- 侧边栏不是静态配置：`src/layout/AppSidebar.tsx` 读取 `useCurrentStaff()` 返回的 `menus` 动态构造导航。
- 页面权限按路径判定：`hasPathPermission()` 用“精确匹配或前缀匹配”；若当前路径不在允许列表会跳 `'/error-403'`。
- 员工权限变更后需要触发 `SidebarContext.refreshMenu()` 刷新菜单（见 `StaffList.tsx` 的 `handleUpdateStaff`）。
- `useCurrentStaff` 带 `sessionStorage` 缓存（键：`CURRENT_STAFF_CACHE`）；涉及权限/身份切换时要同步考虑缓存失效。

## 6) 代理执行建议（提交前自检）
- 改 API：确认是否应走 `requesterWithAuthenticationInstance`，并检查 401 跳转副作用。
- 改登录流：同时核对 `AppLayout`、`AuthorizeCodeCallback`、`useAuthorization`、`useCurrentStaff` 四处状态一致性。
- 改菜单/权限：手动验证 `'/welcome'`、有权限页、无权限页（403）三条路径。
- 提交前最少执行：`npm run lint` 与 `npm run build`。
