FROM node:20-slim

WORKDIR /app

# Install OpenSSL — Prisma engines ke liye zaroori
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]