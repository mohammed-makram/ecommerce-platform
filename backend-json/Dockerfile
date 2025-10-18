FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
COPY . .

# تثبيت curl قبل تغيير اليوزر
RUN apk add --no-cache curl

# إنشاء non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]

