import {
  buildBaseImage,
  envBlock,
  healthcheck,
  labelBlock,
  volumeBlock,
  entrypointBlock,
} from './helpers.js';

export function nodeTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'alpine' : '';

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('node', tag, cfg.baseImage)} AS builder`);
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY package*.json ./');
    lines.push('RUN npm ci --only=production');
    lines.push('');
    lines.push('COPY . .');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${buildBaseImage('node', tag, cfg.baseImage)}`);
  } else {
    lines.push(`FROM ${buildBaseImage('node', tag, cfg.baseImage)}`);
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
    lines.push('RUN addgroup -S appgroup && adduser -S appuser -G appgroup');
  }

  if (cfg.multiStage) {
    lines.push('');
    lines.push('COPY --from=builder ' + cfg.workDir + '/node_modules ./node_modules');
    lines.push('COPY --from=builder ' + cfg.workDir + '/. .');
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
    lines.push(healthcheck(cfg.port || '3000', '/'));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('USER appuser');
  }

  lines.push('');
  lines.push(entrypointBlock(cfg.entrypoint, cfg.startCmd, 'node server.js'));

  return lines.join('\n');
}
