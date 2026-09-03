FROM node:20-bookworm-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run check
RUN npm run build

FROM build AS migration

CMD ["npm", "run", "db:push"]

FROM build AS production-deps

RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=5000
WORKDIR /app

COPY package*.json ./
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 5000
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:5000/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "run", "start"]