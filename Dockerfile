# Development image shared by the Next.js app and the Socket.IO server.
# Source code is bind-mounted by compose.yaml, so edits hot-reload without rebuilding.
FROM node:24-bookworm-slim

# OpenSSL is needed by Prisma; CA certs for HTTPS calls to Supabase, Upstash and Gemini.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN chown node:node /app
USER node

# Install dependencies first so this layer is cached until package files change.
# `npm ci` runs the postinstall `prisma generate`, which needs the schema and config.
COPY --chown=node:node package.json package-lock.json prisma.config.ts ./
COPY --chown=node:node prisma ./prisma
RUN npm ci

COPY --chown=node:node . .

# Pre-create the folders compose mounts as volumes so they are owned by `node`, not root.
RUN mkdir -p .next generated

ENV NEXT_TELEMETRY_DISABLED=1
