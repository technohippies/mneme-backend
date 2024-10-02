FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun install
RUN bun run build

CMD ["bun", "run", "start"]