FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl1.1-compat || apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm install
RUN npx prisma generate
RUN npm run build
ENV NODE_ENV=production
RUN chmod +x scripts/start.sh || true
EXPOSE 3001
CMD ["sh", "scripts/start.sh"]


