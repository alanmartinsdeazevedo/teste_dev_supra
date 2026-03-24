# Build
FROM oven/bun:1.2 AS build
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Production
FROM gcr.io/distroless/nodejs22-debian12 AS production
WORKDIR /app

COPY --from=build /app/.output ./.output

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
