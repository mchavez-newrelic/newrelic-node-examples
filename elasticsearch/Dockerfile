FROM node:lts-slim
EXPOSE 3000

RUN apt-get update && apt-get install curl -y

WORKDIR /app
COPY . .
RUN npm ci
