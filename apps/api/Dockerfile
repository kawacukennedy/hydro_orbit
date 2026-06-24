FROM node:20-alpine

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:generate

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
