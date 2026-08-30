FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run seed -- --force || true

ENV PORT=8000
EXPOSE 8000

CMD ["node", "src/index.js"]
