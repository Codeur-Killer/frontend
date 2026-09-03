FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 4010

ENTRYPOINT ["./docker-entrypoint.sh"]
