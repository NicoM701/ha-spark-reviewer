FROM node:24.13.1-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates git \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @openai/codex@0.153.4
RUN set -eu; arch="$(dpkg --print-architecture)"; \
    case "$arch" in \
      arm64) checksum=ea4e7a581a32ccad6cc7923cb1576ac5859ba4b9a16ab22eb8f8a96e78e2e961 ;; \
      amd64) checksum=e4d4bb4498e8d007abe545b6568926793ace1b6447da598294a610018cb164be ;; \
      *) exit 1 ;; \
    esac; \
    curl -fLsS "https://github.com/cli/cli/releases/download/v2.100.0/gh_2.100.0_linux_${arch}.tar.gz" -o /tmp/gh.tgz; \
    echo "$checksum  /tmp/gh.tgz" | sha256sum -c -; \
    tar xzf /tmp/gh.tgz -C /tmp; \
    install "/tmp/gh_2.100.0_linux_${arch}/bin/gh" /usr/bin/gh; \
    rm -rf /tmp/gh.tgz "/tmp/gh_2.100.0_linux_${arch}"; \
    gh --version
WORKDIR /app
COPY reviewer.mjs scheduler.mjs ./
ENV SPARK_DATA_DIR=/config/reviewer CODEX_HOME=/config/codex GH_CONFIG_DIR=/config/gh NODE_OPTIONS=--max-old-space-size=128
CMD ["node", "/app/scheduler.mjs"]
