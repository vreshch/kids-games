FROM node:26-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG COMMIT_SHA="" BRANCH="" BUILD_TIME=""
RUN mkdir -p public && echo "{\"commit\":\"${COMMIT_SHA}\",\"branch\":\"${BRANCH}\",\"buildTime\":\"${BUILD_TIME}\"}" > public/version.json
RUN npm run build

FROM node:26-alpine AS runner
WORKDIR /app
ARG COMMIT_SHA="" BUILD_TIME=""
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
# /health reads these at runtime; version.json alone only serves the build-time /api/version route.
ENV COMMIT_SHA=${COMMIT_SHA}
ENV BUILD_TIME=${BUILD_TIME}

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
