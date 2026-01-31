# OrixaAdmin Frontend - Agent Guidelines

This file contains essential information for agentic coding assistants working in this repository.

## 语言设置
**重要：始终使用中文回答和交流** - 此项目的所有 AI 助手都必须使用中文进行回复、解释和沟通。

## Project Overview

- **Framework**: React 19.0 with TypeScript 5.7
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS 4.0
- **Routing**: React Router 7.x
- **HTTP Client**: Axios
- **Package Manager**: yarn (preferred) or npm

## Essential Commands

### Development & Build
```bash
# Start development server (runs on http://localhost:5173)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Type checking (included in build)
tsc -b
```

### Code Quality
```bash
# Run ESLint
yarn lint

# Fix ESLint issues automatically
yarn lint --fix
```

### Testing
This project does not have explicit test commands configured. When adding tests, configure them in package.json and update this file.

## Code Style & Conventions

### Imports & Module Organization
- Use ES6 imports with explicit extensions for relative imports: `import Component from "./Component.tsx"`
- Group imports in this order:
  1. React/core libraries
  2. Third-party packages
  3. Internal modules (use `@/` or relative paths)
  4. Type imports (use `import type` for type-only imports)
- Example:
  ```tsx
  import React, {useState} from "react";
  import {Link} from "react-router";
  import {useMessage} from "@/components/ui/message";
  import type {Staff} from "@/types/staff";
  ```

### TypeScript
- Use `interface` for object shapes and public APIs
- Use `type` for unions, intersections, and utility types
- Always provide explicit return types for functions
- Use `React.FC` for functional components (with Props interfaces)
- Avoid `any`; use `unknown` or proper types
- Type environment variables with `import.meta.env` in `.env` files

### Component Structure
- Prefer functional components with hooks
- Use TypeScript interfaces for props with clear descriptions
- Keep components focused and composable
- Example:
  ```tsx
  interface ButtonProps {
    children: ReactNode;
    size?: "sm" | "md";
    variant?: "primary" | "outline";
    onClick?: () => void;
  }

  const Button: React.FC<ButtonProps> = ({ children, size = "md", onClick }) => {
    return <button onClick={onClick}>{children}</button>;
  };
  ```

### Styling with Tailwind CSS
- Use the `cn()` utility from `@/utils` for conditional classes
- Prefer semantic color classes (e.g., `text-gray-800` over hex)
- Use `dark:` prefix for dark mode support
- Responsive design: `md:`, `lg:`, `xl:` breakpoints
- Avoid inline styles; use Tailwind classes instead
- Example:
  ```tsx
  import {cn} from "@/utils";

  <div className={cn("px-4 py-2", isActive && "bg-blue-500")}>
  ```

### File Naming & Organization
- Components: PascalCase (e.g., `UserProfile.tsx`, `PageMeta.tsx`)
- Utilities: camelCase (e.g., `useMountEffect.ts`, `formatDate.ts`)
- Types: camelCase (e.g., `staff.ts`, `user.ts`)
- Hooks: Start with `use` (e.g., `useAuthorization.ts`, `useModal.ts`)
- API files: PascalCase with `Api` suffix (e.g., `AuthenticationApi.ts`)
- Place files in appropriate directories:
  - `/src/components/` - Reusable UI components
  - `/src/pages/` - Page-level components
  - `/src/api/` - API service modules
  - `/src/types/` - TypeScript type definitions
  - `/src/hooks/` - Custom React hooks
  - `/src/utils/` - Utility functions

### API Integration
- Use axios instances from `@/api/NetworkRequester.ts`
- `requesterInstance` - for public endpoints
- `requesterWithAuthenticationInstance` - for authenticated requests (auto-includes Bearer token)
- Store auth token in `sessionStorage` as `USER_TOKEN`
- API response interceptors return `response.data` directly
- Handle 401 errors globally (auto-redirect to login)

### Error Handling
- Use try-catch for async operations
- Display user-friendly errors with `useMessage()` hook
- Log technical errors with `console.error()`
- Example:
  ```tsx
  const message = useMessage();
  try {
    await apiCall();
    message.success("Success", "Operation completed");
  } catch (error) {
    console.error('Operation failed:', error);
    message.error("Error", "Operation failed");
  }
  ```

### State Management
- Use React hooks (`useState`, `useContext`) for local state
- Leverage context providers for global state:
  - `SidebarContext` - sidebar state
  - `ThemeContext` - theme (dark/light mode)
  - `ModalProvider` - modal management
  - `MessageProvider` - toast notifications

### Authentication & Authorization
- PKCE-based OAuth2 flow
- Token stored in `sessionStorage`
- Use `useAuthorization()` hook to check auth status
- Redirect to auth server when unauthenticated
- Environment variables:
  - `VITE_CLIENT_ID`
  - `VITE_AUTH_SERVER_URL`
  - `VITE_REDIRECT_URI`
  - `VITE_GATEWAY_URL` - API base URL

### Routing
- Use React Router 7 (use `react-router` imports, not `react-router-dom`)
- Wrap authenticated routes in `AppLayout`
- Define routes in `App.tsx`
- Use `<Link>` for navigation, not `<a>` tags

### Linting Rules
- TypeScript ESLint with recommended rules
- React Hooks rules enforced
- React Refresh enabled for HMR
- No unused variables
- Proper React component exports

## Best Practices

1. **Before making changes**: Read existing code to understand patterns
2. **Type safety**: Always type props, returns, and API responses
3. **Error boundaries**: Implement error boundaries for critical sections
4. **Performance**: Use `React.memo`, `useMemo`, `useCallback` appropriately
5. **Accessibility**: Include proper ARIA labels and semantic HTML
6. **Code splitting**: Use dynamic imports for large components
7. **Dark mode**: Always include dark mode classes (`dark:text-white`, etc.)
8. **Loading states**: Show loading indicators during async operations
9. **Empty states**: Display helpful UI when data is unavailable
10. **Confirmation dialogs**: Use `modal.confirm()` for destructive actions

## When Adding Features

1. Check existing components/utils before creating new ones
2. Follow the established file structure and naming conventions
3. Add TypeScript types to `/src/types/` if they don't exist
4. Create reusable API methods in appropriate `*Api.ts` files
5. Include loading, error, and empty states in UI components
6. Ensure dark mode compatibility with Tailwind classes
7. Test with `yarn lint` before committing changes
8. Run `yarn build` to verify TypeScript compilation

## Project-Specific Patterns

- **Modals**: Use `useModal()` hook for confirmation dialogs
- **Messages**: Use `useMessage()` hook for toast notifications
- **Breadcrumbs**: Use `PageBreadcrumb` component with page title
- **Meta tags**: Use `PageMeta` component for page metadata
- **Icons**: Import from `@/icons/index.ts` or use inline SVGs
- **SVG handling**: SVG files can be imported as React components (vite-plugin-svgr)

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `VITE_CLIENT_ID` - OAuth client ID
- `VITE_AUTH_SERVER_URL` - Authorization server URL
- `VITE_REDIRECT_URI` - OAuth redirect URI
- `VITE_GATEWAY_URL` - API gateway base URL
