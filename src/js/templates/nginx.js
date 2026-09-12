import { buildBaseImage, envBlock, healthcheck, labelBlock, volumeBlock } from './helpers.js';

export function nginxTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'alpine' : '';

  lines.push(`FROM ${buildBaseImage('nginx', tag, cfg.baseImage)}`);
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

  lines.push('');
  lines.push('COPY . /usr/share/nginx/html');
  lines.push('COPY nginx.conf /etc/nginx/conf.d/default.conf');

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
