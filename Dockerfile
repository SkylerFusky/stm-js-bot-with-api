# syntax=docker/dockerfile:1
FROM node:latest
WORKDIR /usr/app
COPY . /usr/app
RUN npm i
RUN npm i -g nodemon
EXPOSE 5000
CMD ["nodemon", "./src/index.js"]