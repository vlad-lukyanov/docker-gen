import { buildBaseImage, envBlock, healthcheck, labelBlock } from './helpers.js';

export function phpTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'alpine' : '';

  lines.push(`FROM ${buildBaseImage('php', tag, cfg.baseImage)}`);
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

  if (cfg.nonRoot) {
    lines.push('');
    if (cfg.alpine) {
      lines.push('RUN addgroup -S appgroup && adduser -S appuser -G appgroup');
    } else {
      lines.push('RUN groupadd -r appgroup && useradd -r -g appgroup appuser');
    }
  }

  lines.push('');
  lines.push('RUN apt-get update && apt-get install -y --no-install-recommends \\');
  lines.push('    unzip \\');
  lines.push('    && docker-php-ext-install pdo pdo_mysql \\');
  lines.push('    && rm -rf /var/lib/apt/lists/*');

  lines.push('');
  lines.push('COPY . .');

  if (cfg.port) {
    lines.push('');
    lines.push('EXPOSE ' + cfg.port);
  }

  if (cfg.healthcheck) {
    lines.push('');
    lines.push(healthcheck(cfg.port || '80', '/'));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('USER appuser');
  }

  const cmd = cfg.startCmd || 'php -S 0.0.0.0:80';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
