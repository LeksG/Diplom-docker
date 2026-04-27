# 1. Етап збірки (Builder)
FROM node:20-alpine AS builder

# Prisma потребує OpenSSL для роботи
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Копіюємо файли залежностей та схему Prisma
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Встановлюємо всі залежності
RUN npm ci

# Генеруємо Prisma Client (обов'язково перед збіркою!)
RUN npx prisma generate

# Копіюємо весь інший код твого проєкту
COPY . .

# Білдимо проєкт
RUN npm run build

# 2. Фінальний етап (Runner) - робимо контейнер легким
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

# Копіюємо тільки те, що потрібно для запуску готового сайту
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Запускаємо готовий сервер
CMD ["npm", "start"]