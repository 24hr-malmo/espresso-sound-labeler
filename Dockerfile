FROM arm32v7/node:10.12.0-slim

ARG VERSION=0-DEV
ENV VERSION=${VERSION}

RUN mkdir -p /app/node_modules

RUN apt-get update && apt-get install -y build-essential vim unzip 
RUN apt-get install alsa-base alsa-utils -y
RUN apt-get install python -y



WORKDIR /app

RUN wget abyz.me.uk/rpi/pigpio/pigpio.zip
RUN unzip pigpio.zip
WORKDIR /app/PIGPIO
RUN make
RUN make install

RUN npm i nodemon -g

COPY package.json /app
RUN npm i

WORKDIR /app/src

CMD ["nodemon", "index.js"]
