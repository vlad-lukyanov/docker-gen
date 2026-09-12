import { buildBaseImage, envBlock, healthcheck } from './helpers.js';

export function rustTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'alpine' : '';

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('rust', tag)} AS builder`);
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY Cargo.toml Cargo.lock ./');
    lines.push(
      'RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src',
    );
    lines.push('');
    lines.push('COPY . .');
    lines.push('RUN touch src/main.rs && cargo build --release');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${cfg.alpine ? 'alpine:latest' : 'debian:bookworm-slim'}`);
    if (cfg.alpine) {
      lines.push('RUN apk add --no-cache ca-certificates');
    }
    lines.push('');
    lines.push('WORKDIR ' + cfg.workDir);
  } else {
    lines.push(`FROM ${buildBaseImage('rust', tag)}`);
    lines.push('');
    lines.push('WORKDIR ' + cfg.workDir);
  }

  if (cfg.envVars.length > 0) {
    lines.push('');
    lines.push(envBlock(cfg.envVars));
  }

  if (cfg.nonRoot && cfg.alpine) {
    lines.push('');
    lines.push('RUN addgroup -S appgroup && adduser -S appuser -G appgroup');
  } else if (cfg.nonRoot) {
    lines.push('');
    lines.push('RUN groupadd -r appgroup && useradd -r -g appgroup appuser');
  }

  if (cfg.multiStage) {
    lines.push('');
    lines.push('COPY --from=builder /app/target/release/server .');
  } else {
    lines.push('');
    lines.push('COPY . .');
    lines.push('');
    lines.push('RUN cargo build --release');
  }

  if (cfg.port) {
    lines.push('');
    lines.push('EXPOSE ' + cfg.port);
  }

  if (cfg.healthcheck) {
    lines.push('');
    lines.push(healthcheck(cfg.port || '8080', '/'));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('USER appuser');
  }

  const cmd = cfg.startCmd || './server';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
