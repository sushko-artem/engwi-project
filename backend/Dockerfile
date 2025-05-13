
# Development stage
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

COPY prisma/schema.prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

CMD [ "npm", "run", "start:dev" ]