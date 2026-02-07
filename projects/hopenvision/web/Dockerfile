# === Build stage ===
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# === Runtime stage ===
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

RUN rm -rf ./*

COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
