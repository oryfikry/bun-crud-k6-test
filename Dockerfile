FROM docker.io/oven/bun:latest

WORKDIR /app

COPY package.json ./
RUN bun install

COPY index.js ./

EXPOSE 3001
CMD ["bun", "index.js"]
