# ========== 阶段 1：构建 ==========
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存层
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 复制源码和 K8s 环境变量
COPY . .
COPY .env.k8s .env

# 构建生产版本（跳过 tsc 类型检查，Vite 内置 esbuild 处理 TS 编译）
RUN npx vite build

# ========== 阶段 2：运行 ==========
FROM nginx:stable-alpine AS runtime

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
