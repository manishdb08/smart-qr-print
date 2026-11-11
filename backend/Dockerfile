FROM node:20-alpine AS builder

WORKDIR /app

# Install native dependencies for better-sqlite3 build if required
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/
COPY storage/ ./storage/

RUN mkdir -p storage/data storage/uploads

EXPOSE 4000

USER node

CMD ["node", "src/server.js"]
