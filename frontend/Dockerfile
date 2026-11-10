FROM node:18-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=optional

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]