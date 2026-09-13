import { buildBaseImage, envBlock, healthcheck, labelBlock, volumeBlock } from './helpers.js';

export function elixirTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'alpine' : '';

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('elixir', tag, cfg.baseImage)} AS builder`);
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY mix.exs mix.lock ./');
    lines.push('RUN mix deps.get');
    lines.push('');
    lines.push('COPY . .');
    lines.push('RUN MIX_ENV=prod mix release');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${cfg.baseImage || (cfg.alpine ? 'alpine:latest' : 'debian:bookworm-slim')}`);
  } else {
    lines.push(`FROM ${buildBaseImage('elixir', tag, cfg.baseImage)}`);
  }

  lines.push('');
  lines.push('WORKDIR ' + cfg.workDir);

  if (cfg.envVars.length > 0) {
    lines.push('');
    lines.push(envBlock(cfg.envVars));
  }

  if ((cfg.labels || []).length > 0) {
    lines.push('');
    lines.push(labelBlock(cfg.labels));
  }

  if (cfg.volume) {
    lines.push('');
    lines.push(volumeBlock(cfg.volume));
  }

  if (cfg.nonRoot) {
    lines.push('');
    if (cfg.alpine) {
      lines.push('RUN addgroup -S appgroup && adduser -S appuser -G appgroup');
    } else {
      lines.push('RUN groupadd -r appgroup && useradd -r -g appgroup appuser');
    }
  }

  if (cfg.multiStage) {
    lines.push('');
    lines.push(
      'COPY --from=builder /app/_build/prod/rel/app/releases/0.1.0/app.tar.gz /tmp/app.tar.gz',
    );
    lines.push('RUN tar -xzf /tmp/app.tar.gz -C /opt && rm -f /tmp/app.tar.gz');
  } else {
    lines.push('');
    lines.push('COPY . .');
  }

  if (cfg.port) {
    lines.push('');
    lines.push('EXPOSE ' + cfg.port);
  }

  if (cfg.healthcheck) {
    lines.push('');
    lines.push(healthcheck(cfg.port || '4000', '/'));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('USER appuser');
  }

  const cmd = cfg.startCmd || '/opt/app/bin/app start';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
