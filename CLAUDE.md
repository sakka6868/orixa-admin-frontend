# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 项目规范

## 语言要求

- 所有回复必须使用中文
- 所有思考过程必须使用中文
- 代码注释使用中文
- Git commit message 使用中文
- 与用户的所有交互一律使用中文，不得出现英文描述或解释

## 开发命令

```bash
yarn dev        # 启动开发服务器 (localhost:5173)
yarn build      # TypeScript 类型检查 + Vite 生产构建 (tsc -b && vite build)
yarn lint       # ESLint 代码检查
yarn preview    # 预览生产构建
```

没有测试框架，项目未配置单元测试。

## 项目概述

Orixa Admin Frontend 是一个 React SPA 后台管理面板，基于 React 19 + Vite 6 + TypeScript 5.7 + Tailwind CSS 4。使用 OAuth 2.0 PKCE 认证流程，支持动态权限菜单。

## 架构

### 请求层 (src/api/)

两个 Axios 实例（`NetworkRequester.ts`）：
- `requesterInstance`：无认证请求（仅用于 token 交换）
- `requesterWithAuthenticationInstance`：带 Bearer token 的认证请求，401 时自动清除 session 并跳转首页

API 模块按业务划分：
- `AuthenticationApi`：OAuth PKCE 授权流程（生成 code_verifier → SHA-256 → 重定向授权服务器 → 交换 token）
- `FoundationApi`：用户/角色/租户 CRUD
- `SystemApi`：菜单/员工管理，`getCurrentStaff()` 是获取当前用户权限的关键接口
- `MonitorApi`：服务健康状态和指标监控

### 认证与权限流程

1. `AppLayout` 检测未认证 → `AuthenticationApi.redirect()` 跳转授权服务器
2. 回调页 `AuthorizeCodeCallback` / `OAuthCallback` 交换 code → token，存入 `sessionStorage("USER_TOKEN")`
3. `useAuthorization()` 管理授权信息，存储在 `sessionStorage("USER_AUTHORIZATION")`，使用发布-订阅模式跨组件同步
4. `useCurrentStaff()` 获取当前员工及其菜单权限，缓存在 `sessionStorage("CURRENT_STAFF_CACHE")`
5. `AppSidebar` 根据 `StaffListItem.menus` 动态渲染菜单，并在路由变化时校验路径权限，无权限跳转 403

### 状态管理

不使用 Redux/Zustand，全部基于 React Context：
- `ThemeContext`：主题切换（light/dark/asuka），持久化到 localStorage
- `SidebarContext`：侧边栏展开/收起/移动端状态，`refreshMenu()` 可触发菜单重新加载
- `MessageContext`：全局消息提示（顶部弹出，自动关闭）
- `ModalContext`：全局确认/提示对话框（Promise 式调用）

Provider 嵌套顺序（`App.tsx`）：`ModalProvider` → `MessageProvider` → `Router`

### 布局 (src/layout/)

`AppLayout` 是所有需认证页面的外壳：
- 未认证时自动发起 OAuth 重定向（使用 `useRef` 防止重复重定向）
- 内部包裹 `SidebarProvider` → `LayoutContent`（Sidebar + Header + Outlet）
- 侧边栏响应式断点：1280px（xl），移动端自动收起

### 路由结构 (App.tsx)

所有页面使用 `lazy()` 懒加载 + `Suspense`。

AppLayout 内（需认证）：`/` `/welcome` `/analytics/monitor` `/system/menus` `/system/staffs` `/foundation/users` `/foundation/roles` `/foundation/tenants` `/api-keys`

独立页面：`/authorize-code-callback` `/oauth-callback`

错误页：`/error-500` `/error-503` `/error-403` `/maintenance` `/coming-soon` `*`(404)

### 自定义 Hooks

- `useMountEffect(fn)`：严格模式安全的一次性执行 Hook（替代 `useEffect(fn, [])`）
- `useCurrentStaff()`：返回 `{ staff, loading, error, refetch, clearCache }`
- `useAuthorization()`：返回 `{ authorization, resetAuthorization }`，发布-订阅模式
- `useMessage()`：返回 `{ success, error, warning, info }` 快捷方法
- `useModal()`：返回 `{ confirm(config): Promise<boolean>, alert(config): Promise<void> }`

### SVG 处理

通过 `vite-plugin-svgr` 将 SVG 转为 React 组件，使用命名导出 `ReactComponent`：
```typescript
import { ReactComponent as MyIcon } from './icon.svg';
```

## 环境变量

```
VITE_CLIENT_ID          # OAuth 客户端 ID
VITE_AUTH_SERVER_URL     # 授权服务器地址
VITE_REDIRECT_URI        # OAuth 回调 URI
VITE_GATEWAY_URL         # API 网关地址（Axios baseURL）
```

配置文件：`.env`（本地）、`.env.example`（模板）、`.env.k8s`（K8s 部署）

## 常用开发模式

### 添加新页面

1. 创建 `src/pages/Module/Page.tsx`
2. 在 `App.tsx` 中添加 lazy import 和 Route（放在 `AppLayout` 内）
3. 页面中使用 `useMountEffect` 加载初始数据

### 添加新 API

在对应的 `src/api/XxxApi.ts` 中添加方法，使用 `requesterWithAuthenticationInstance`，类型定义放在 `src/types/` 下。

### 消息提示与确认框

```typescript
const message = useMessage();
message.success("标题", "内容");

const modal = useModal();
const confirmed = await modal.confirm({ message: "确认删除？", type: "danger" });
```
