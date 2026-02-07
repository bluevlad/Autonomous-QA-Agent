# HopenVision 서버 설정 가이드

## 1. 환경 구성 개요

### 1.1 환경 정의

| 환경 | 용도 | 호스트 | 컨테이너 |
|------|------|--------|----------|
| 개발 (Development) | 로컬 개발 및 테스트 | Windows 11 (***REMOVED_IP***) | Docker Desktop |
| 운영 (Production) | 실서비스 운영 | macOS (***REMOVED_IP***) | OrbStack |

### 1.2 포트 할당

| 서비스 | 개발 포트 | 운영 포트 | 설명 |
|--------|----------|----------|------|
| hopenvision-frontend | 4050 | 4050 | React 웹 애플리케이션 |
| hopenvision-backend | 9050 | 9050 | Spring Boot REST API |
| hopenvision-db | 5432 | 5432 | PostgreSQL 데이터베이스 |
| Claude-Opus-bluevlad | - | 4060 | Claude Code 에이전트 서비스 (macbook) |
| Swagger UI | 9050/swagger-ui.html | - | API 문서 (개발만) |
| H2 Console | 9050/h2-console | - | H2 DB 콘솔 (로컬만) |

### 1.3 포트 할당 계획

향후 서비스 추가 시 다음 규칙을 따릅니다:

| 포트 범위 | 용도 | 비고 |
|-----------|------|------|
| 4050-4059 | 웹 프론트엔드 서비스 | 4050: hopenvision |
| 4060-4069 | AI/에이전트 서비스 | 4060: Claude-Opus-bluevlad |
| 4070-4079 | 예비 (향후 확장) | - |
| 5050-5059 | 관리 도구 | 5050: pgAdmin |
| 5432 | PostgreSQL | 고정 |
| 9050-9059 | 백엔드 API 서비스 | 9050: hopenvision |

**다음 사용 가능 포트:**
- 프론트엔드: 4051
- AI/에이전트: 4061
- 관리 도구: 5051
- 백엔드 API: 9051

---

## 2. Docker Compose 설정

### 2.1 개발용 (docker-compose.local.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  hopenvision-db:
    image: postgres:16-alpine
    container_name: hopenvision-db
    environment:
      POSTGRES_DB: hopenvision
      POSTGRES_USER: hopenvision
      POSTGRES_PASSWORD: ***REMOVED***
      TZ: Asia/Seoul
    ports:
      - "5432:5432"
    volumes:
      - hopenvision-postgres-data:/var/lib/postgresql/data
      - ./doc/sql:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hopenvision"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - hopenvision-network
    profiles:
      - db
      - all

  # Spring Boot Backend (개발용)
  hopenvision-backend:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: hopenvision-backend
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://hopenvision-db:5432/hopenvision
      SPRING_DATASOURCE_USERNAME: hopenvision
      SPRING_DATASOURCE_PASSWORD: ***REMOVED***
      TZ: Asia/Seoul
    ports:
      - "9050:8080"
    depends_on:
      hopenvision-db:
        condition: service_healthy
    networks:
      - hopenvision-network
    profiles:
      - backend
      - all

  # React Frontend (개발용)
  hopenvision-frontend:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: hopenvision-frontend
    environment:
      VITE_API_URL: http://localhost:9050
      TZ: Asia/Seoul
    ports:
      - "4050:80"
    depends_on:
      - hopenvision-backend
    networks:
      - hopenvision-network
    profiles:
      - frontend
      - all

  # pgAdmin (개발 도구)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: hopenvision-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ***REMOVED_EMAIL***
      PGADMIN_DEFAULT_PASSWORD: ***REMOVED***
    ports:
      - "5050:80"
    networks:
      - hopenvision-network
    profiles:
      - tools

networks:
  hopenvision-network:
    driver: bridge

volumes:
  hopenvision-postgres-data:
```

### 2.2 운영용 (docker-compose.prod.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  hopenvision-db:
    image: postgres:16-alpine
    container_name: hopenvision-db
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME:-hopenvision}
      POSTGRES_USER: ${DB_USER:-hopenvision}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      TZ: Asia/Seoul
    ports:
      - "5432:5432"
    volumes:
      - hopenvision-postgres-data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-hopenvision}"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - hopenvision-db-network
    deploy:
      resources:
        limits:
          memory: 1G

  # Spring Boot Backend
  hopenvision-backend:
    image: hopenvision-backend:latest
    container_name: hopenvision-backend
    restart: always
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://hopenvision-db:5432/${DB_NAME:-hopenvision}
      SPRING_DATASOURCE_USERNAME: ${DB_USER:-hopenvision}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      TZ: Asia/Seoul
    ports:
      - "9050:8080"
    depends_on:
      hopenvision-db:
        condition: service_healthy
    networks:
      - hopenvision-app-network
      - hopenvision-db-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 2G

  # React Frontend
  hopenvision-frontend:
    image: hopenvision-frontend:latest
    container_name: hopenvision-frontend
    restart: always
    environment:
      TZ: Asia/Seoul
    ports:
      - "4050:80"
    depends_on:
      - hopenvision-backend
    networks:
      - hopenvision-app-network
    deploy:
      resources:
        limits:
          memory: 256M

networks:
  hopenvision-app-network:
    driver: bridge
  hopenvision-db-network:
    driver: bridge
    internal: true  # 외부 접근 차단

volumes:
  hopenvision-postgres-data:
```

---

## 3. Dockerfile 설정

### 3.1 Backend Dockerfile (api/Dockerfile)

```dockerfile
# Build stage
FROM gradle:8-jdk17-alpine AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src
RUN gradle build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 보안: non-root 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 타임존 설정
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

# JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 권한 설정
RUN chown -R appuser:appgroup /app
USER appuser

# 포트 노출
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

# 실행
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}", "app.jar"]
```

### 3.2 Frontend Dockerfile (web/Dockerfile)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 타임존 설정
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

# 빌드 결과물 복사
COPY --from=builder /app/dist .

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 Frontend Nginx 설정 (web/nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (선택적)
    location /api {
        proxy_pass http://hopenvision-backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 캐싱 설정
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## 4. Nginx Reverse Proxy 설정

### 4.1 메인 Proxy 설정 (docker/nginx/hopenvision.conf)

```nginx
# HopenVision 서비스
upstream hopenvision_frontend {
    server ***REMOVED_IP***:4050;
}

upstream hopenvision_backend {
    server ***REMOVED_IP***:9050;
}

# HTTP to HTTPS 리다이렉트
server {
    listen 80;
    server_name hopenvision.unmong.com;
    return 301 https://$host$request_uri;
}

# HTTPS 서버
server {
    listen 443 ssl http2;
    server_name hopenvision.unmong.com;

    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/unmong.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/unmong.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # 프론트엔드
    location / {
        proxy_pass http://hopenvision_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://hopenvision_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 파일 업로드 크기 제한
        client_max_body_size 20M;
    }
}
```

---

## 5. 환경별 Spring Boot 설정

### 5.1 공통 설정 (application.yml)

```yaml
spring:
  application:
    name: hopenvision-api

server:
  port: 8080
  servlet:
    encoding:
      charset: UTF-8
      enabled: true
      force: true

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method
```

### 5.2 로컬 설정 (application-local.yml)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:hopenvision;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    com.hopenvision: DEBUG
    org.hibernate.SQL: DEBUG
```

### 5.3 개발 설정 (application-dev.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:hopenvision}
    driver-class-name: org.postgresql.Driver
    username: ${DB_USERNAME:hopenvision}
    password: ${DB_PASSWORD:***REMOVED***}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  sql:
    init:
      mode: always

logging:
  level:
    com.hopenvision: DEBUG
```

### 5.4 운영 설정 (application-prod.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT:5432}/${DB_NAME}
    driver-class-name: org.postgresql.Driver
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

springdoc:
  swagger-ui:
    enabled: false

logging:
  level:
    com.hopenvision: INFO
    org.hibernate: WARN
```

---

## 6. 자동화 스크립트

### 6.1 시작 스크립트 (scripts/start-all.ps1)

```powershell
# HopenVision 서비스 시작 스크립트 (Windows)

Write-Host "=== HopenVision 서비스 시작 ===" -ForegroundColor Green

# Docker Compose 실행
Set-Location "C:\GIT\hopenvision"

Write-Host "1. 데이터베이스 시작..." -ForegroundColor Yellow
docker compose -f docker-compose.yml up -d hopenvision-db

Write-Host "2. 데이터베이스 준비 대기 (10초)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "3. Backend 시작..." -ForegroundColor Yellow
Set-Location "C:\GIT\hopenvision\api"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c gradlew.bat bootRun"

Write-Host "4. Frontend 시작..." -ForegroundColor Yellow
Set-Location "C:\GIT\hopenvision\web"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev"

Write-Host ""
Write-Host "=== 서비스 시작 완료 ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Swagger:  http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
```

### 6.2 중지 스크립트 (scripts/stop-all.ps1)

```powershell
# HopenVision 서비스 중지 스크립트 (Windows)

Write-Host "=== HopenVision 서비스 중지 ===" -ForegroundColor Yellow

# Node.js 프로세스 중지
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Java 프로세스 중지 (주의: 다른 Java 프로세스도 중지될 수 있음)
# Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force

# Docker 컨테이너 중지
Set-Location "C:\GIT\hopenvision"
docker compose down

Write-Host "=== 서비스 중지 완료 ===" -ForegroundColor Green
```

### 6.3 상태 확인 스크립트 (scripts/status.ps1)

```powershell
# HopenVision 서비스 상태 확인 스크립트 (Windows)

Write-Host "=== HopenVision 서비스 상태 ===" -ForegroundColor Cyan
Write-Host ""

# Docker 컨테이너 상태
Write-Host "[Docker Containers]" -ForegroundColor Yellow
docker ps --filter "name=hopenvision" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# 포트 상태 확인
Write-Host "[Port Status]" -ForegroundColor Yellow
$ports = @(5432, 8080, 5173, 4050, 9050)
foreach ($port in $ports) {
    $result = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "  Port $port : OPEN" -ForegroundColor Green
    } else {
        Write-Host "  Port $port : CLOSED" -ForegroundColor Red
    }
}
Write-Host ""

# API 헬스 체크
Write-Host "[API Health Check]" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  Backend API: UP" -ForegroundColor Green
} catch {
    Write-Host "  Backend API: DOWN" -ForegroundColor Red
}
```

### 6.4 배포 스크립트 (scripts/deploy.ps1)

```powershell
# HopenVision 배포 스크립트 (Windows → Production)

param(
    [string]$Target = "***REMOVED_IP***",
    [string]$User = "admin"
)

Write-Host "=== HopenVision 배포 시작 ===" -ForegroundColor Green

# 1. 이미지 빌드
Write-Host "1. Docker 이미지 빌드..." -ForegroundColor Yellow
Set-Location "C:\GIT\hopenvision"
docker compose -f docker/docker-compose.prod.yml build

# 2. 이미지 태깅
Write-Host "2. 이미지 태깅..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker tag hopenvision-backend:latest hopenvision-backend:$timestamp
docker tag hopenvision-frontend:latest hopenvision-frontend:$timestamp

# 3. 이미지 저장
Write-Host "3. 이미지 저장..." -ForegroundColor Yellow
$exportDir = "C:\GIT\hopenvision\docker-exports"
if (-not (Test-Path $exportDir)) { New-Item -ItemType Directory -Path $exportDir }
docker save hopenvision-backend:latest | gzip > "$exportDir\hopenvision-backend.tar.gz"
docker save hopenvision-frontend:latest | gzip > "$exportDir\hopenvision-frontend.tar.gz"

# 4. 원격 전송
Write-Host "4. 원격 서버로 전송..." -ForegroundColor Yellow
scp "$exportDir\hopenvision-*.tar.gz" "${User}@${Target}:/home/$User/docker-images/"

# 5. 원격 배포
Write-Host "5. 원격 서버에서 배포..." -ForegroundColor Yellow
ssh "${User}@${Target}" @"
cd /home/$User/hopenvision
docker load < /home/$User/docker-images/hopenvision-backend.tar.gz
docker load < /home/$User/docker-images/hopenvision-frontend.tar.gz
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
"@

Write-Host "=== 배포 완료 ===" -ForegroundColor Green
```

---

## 7. GitHub Actions CI/CD

### 7.1 배포 워크플로우 (.github/workflows/deploy.yml)

```yaml
name: Deploy HopenVision

on:
  push:
    branches: [ "prod" ]

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Create .env file
        run: |
          echo "DB_HOST=${{ secrets.DB_HOST }}" >> .env
          echo "DB_PORT=${{ secrets.DB_PORT }}" >> .env
          echo "DB_NAME=${{ secrets.DB_NAME }}" >> .env
          echo "DB_USERNAME=${{ secrets.DB_USERNAME }}" >> .env
          echo "DB_PASSWORD=${{ secrets.DB_PASSWORD }}" >> .env

      - name: Build and Deploy
        run: |
          docker compose -f docker/docker-compose.prod.yml down
          docker compose -f docker/docker-compose.prod.yml build
          docker compose -f docker/docker-compose.prod.yml up -d

      - name: Health Check
        run: |
          sleep 30
          curl -f http://localhost:9050/actuator/health || exit 1

      - name: Cleanup
        run: |
          docker image prune -f
```

---

## 8. 보안 설정

### 8.1 환경변수 관리

```bash
# .env.example (Git에 포함)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hopenvision
DB_USERNAME=hopenvision
DB_PASSWORD=

# .env (Git에서 제외, 실제 값 포함)
DB_HOST=***REMOVED_IP***
DB_PORT=5432
DB_NAME=hopenvision
DB_USERNAME=hopenvision
DB_PASSWORD=실제비밀번호
```

### 8.2 .gitignore

```gitignore
# 환경변수
.env
.env.local
.env.*.local
!.env.example

# Docker 이미지
docker-exports/

# 데이터베이스 덤프
*.sql
*.dump
backups/

# 인증서
*.pem
*.key
*.crt
```

---

## 9. 모니터링

### 9.1 Spring Boot Actuator

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when_authorized
```

### 9.2 로그 설정

```yaml
# logback-spring.xml
logging:
  file:
    name: /var/log/hopenvision/application.log
  logback:
    rollingpolicy:
      max-file-size: 10MB
      max-history: 30
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-02-06 | 초안 작성 |
| 1.1 | 2026-02-07 | Claude-Opus-bluevlad 포트(4060) 추가, 포트 할당 계획 수립 |
