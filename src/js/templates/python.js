import { buildBaseImage, envBlock, healthcheck } from './helpers.js';

export function pythonTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'slim' : '';

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('python', tag, cfg.baseImage)} AS builder`);
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY requirements.txt .');
    lines.push('RUN pip install --no-cache-dir --prefix=/install -r requirements.txt');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${buildBaseImage('python', tag, cfg.baseImage)}`);
  } else {
    lines.push(`FROM ${buildBaseImage('python', tag, cfg.baseImage)}`);
  }

  lines.push('');
  lines.push('WORKDIR ' + cfg.workDir);

  if (cfg.envVars.length > 0) {
    lines.push('');
    lines.push(envBlock(cfg.envVars));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('RUN groupadd -r appgroup && useradd -r -g appgroup appuser');
  }

  if (cfg.multiStage) {
    lines.push('');
    lines.push('COPY --from=builder /install /usr/local');
  }

  lines.push('');
  lines.push('COPY . .');

  if (cfg.port) {
    lines.push('');
    lines.push('EXPOSE ' + cfg.port);
  }

  if (cfg.healthcheck) {
    lines.push('');
    lines.push(healthcheck(cfg.port || '8000', '/'));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('USER appuser');
  }

  const cmd = cfg.startCmd || 'python app.py';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
