# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG FROM_EMAIL
ARG TO_EMAIL
ARG BUZZSPROUT_PODCAST_ID
RUN --mount=type=secret,id=BUZZSPROUT_API_TOKEN,required=true \
    --mount=type=secret,id=RESEND_API_KEY,required=true \
    export BUZZSPROUT_API_TOKEN="$(cat /run/secrets/BUZZSPROUT_API_TOKEN)" \
    RESEND_API_KEY="$(cat /run/secrets/RESEND_API_KEY)" \
    FROM_EMAIL="$FROM_EMAIL" \
    TO_EMAIL="$TO_EMAIL" \
    BUZZSPROUT_PODCAST_ID="$BUZZSPROUT_PODCAST_ID" && \
    npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV HOST=0.0.0.0 \
    PORT=4321 \
    NODE_ENV=production

COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
