FROM node:20-alpine

WORKDIR /usr/src/api

COPY package*.json ./
RUN npm install

CMD ["npm", "run", "start:dev"]
