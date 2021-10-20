FROM node:14-alpine
RUN apk add dumb-init

WORKDIR /usr/app

COPY --chown=node:node ./package.json ./
COPY --chown=node:node ./package-lock.json ./

RUN npm ci && npm i -g typescript

COPY --chown=node:node ./ ./

RUN tsc

USER node
EXPOSE 3210
ENTRYPOINT ["dumb-init","node","./dist/src/webhook/server.js"]
