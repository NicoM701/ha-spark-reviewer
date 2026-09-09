FROM node:24.13.1-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends gh ca-certificates git \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @openai/codex@0.153.4
WORKDIR /app
COPY reviewer.mjs scheduler.mjs ./
ENV SPARK_DATA_DIR=/data/reviewer CODEX_HOME=/config/codex GH_CONFIG_DIR=/config/gh NODE_OPTIONS=--max-old-space-size=128
CMD ["node", "/app/scheduler.mjs"]
