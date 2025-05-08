
# Development stage
FROM node:21-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

CMD [ "npm", "run", "start:dev" ]