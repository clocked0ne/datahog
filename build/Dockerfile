FROM node:14-alpine
RUN apk add dumb-init

WORKDIR /usr/api

COPY --chown=node:node ../package.json ./
COPY --chown=node:node ../package-lock.json ./

RUN npm install --only=prod

USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init","node","./src/server.js"]
