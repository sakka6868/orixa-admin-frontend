# ========== 构建在本地完成，直接使用 dist/ 目录 ==========
FROM nginx:stable-alpine AS runtime

# 复制项目根目录预生成的自签名证书
RUN mkdir -p /etc/nginx/ssl
COPY ssl/tls.crt /etc/nginx/ssl/tls.crt
COPY ssl/tls.key /etc/nginx/ssl/tls.key

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
