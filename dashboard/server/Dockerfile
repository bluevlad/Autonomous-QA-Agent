FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install tsx

COPY src ./src
COPY tsconfig.json ./

EXPOSE 3091

CMD ["npx", "tsx", "src/index.ts"]
