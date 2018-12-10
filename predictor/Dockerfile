FROM node:10.12

ARG VERSION=0-DEV
ENV VERSION=${VERSION}

RUN mkdir -p /app/node_modules

RUN apt-get update && apt-get install -y build-essential vim unzip 

WORKDIR /app

COPY package.json /app
RUN npm i

COPY ./src /app/src
WORKDIR /app/src

# SLIMIFY IT
FROM debian:jessie-slim

COPY --from=0 /usr/bin/gcc* /usr/bin/
COPY --from=0 /usr/local/bin/node /usr/local/bin

WORKDIR /app
COPY --from=0 /app /app

WORKDIR /app/src
CMD ["node", "index.js"]
