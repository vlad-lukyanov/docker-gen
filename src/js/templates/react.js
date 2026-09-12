import { buildBaseImage, envBlock, healthcheck } from './helpers.js';

export function reactTemplate(cfg) {
  const lines = [];

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('node', cfg.alpine ? 'alpine' : '')} AS builder`);
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY package*.json ./');
    lines.push('RUN npm ci');
    lines.push('');
    lines.push('COPY . .');
    lines.push('RUN npm run build');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${buildBaseImage('nginx', cfg.alpine ? 'alpine' : '')}`);
  } else {
    lines.push(`FROM ${buildBaseImage('node', cfg.alpine ? 'alpine' : '')}`);
  }

  lines.push('');
  lines.push('WORKDIR ' + cfg.workDir);

  if (cfg.envVars.length > 0) {
    lines.push('');
    lines.push(envBlock(cfg.envVars));
  }

  if (cfg.multiStage) {
    lines.push('');
    lines.push('COPY --from=builder /app/dist /usr/share/nginx/html');
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
    lines.push(healthcheck(cfg.port || '80', '/'));
  }

  const cmd = cfg.startCmd || 'nginx -g "daemon off;"';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
