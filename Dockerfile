FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
# If you want to use build args, uncomment the ARG lines and pass them during build
# ARG NEXT_PUBLIC_FIREBASE_API_KEY
# ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
# ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
# ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
# ARG NEXT_PUBLIC_FIREBASE_APP_ID

# Since we use NEXT_PUBLIC variables, they are baked into the frontend build.
# For Cloud Run deployments via gcloud, it is easiest to rely on the environment variables
# passed during the run/build command. If they aren't provided at build, the public vars might be empty.
# In Next.js standalone mode, we can supply them at runtime, but public vars are statically replaced.
# Best practice for Cloud Run + Next is to pass them via --set-env-vars and --set-build-env-vars.

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
