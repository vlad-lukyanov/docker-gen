import { buildBaseImage, envBlock, healthcheck } from './helpers.js';

export function rubyTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'alpine' : '';

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('ruby', tag)} AS builder`);
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY Gemfile Gemfile.lock ./');
    lines.push('RUN bundle install');
    lines.push('');
    lines.push('COPY . .');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${buildBaseImage('ruby', tag)}`);
  } else {
    lines.push(`FROM ${buildBaseImage('ruby', tag)}`);
  }

  lines.push('');
  lines.push('WORKDIR ' + cfg.workDir);

  if (cfg.envVars.length > 0) {
    lines.push('');
    lines.push(envBlock(cfg.envVars));
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
    lines.push('COPY --from=builder /app .');
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

  const cmd = cfg.startCmd || 'bundle exec rails server -b 0.0.0.0';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
