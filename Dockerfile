FROM node:24.1.0-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:24.1.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache tini

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package*.json ./

USER node
EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/main.js"]