import { buildBaseImage, envBlock, healthcheck } from './helpers.js';

export function golangTemplate(cfg) {
  const lines = [];
  const tag = cfg.alpine ? 'alpine' : '';

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('golang', tag)} AS builder`);
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY go.mod go.sum ./');
    lines.push('RUN go mod download');
    lines.push('');
    lines.push('COPY . .');
    lines.push('RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${cfg.alpine ? 'alpine:latest' : 'gcr.io/distroless/static-debian12'}`);
    lines.push('');
    lines.push('WORKDIR ' + cfg.workDir);
  } else {
    lines.push(`FROM ${buildBaseImage('golang', tag)}`);
    lines.push('');
    lines.push('WORKDIR ' + cfg.workDir);
  }

  if (cfg.envVars.length > 0) {
    lines.push('');
    lines.push(envBlock(cfg.envVars));
  }

  if (cfg.multiStage) {
    lines.push('');
    lines.push('COPY --from=builder /app/server .');
  } else {
    lines.push('');
    lines.push('COPY . .');
    if (!cfg.multiStage) {
      lines.push('');
      lines.push('RUN go build -o server .');
    }
  }

  if (cfg.port) {
    lines.push('');
    lines.push('EXPOSE ' + cfg.port);
  }

  if (cfg.healthcheck) {
    lines.push('');
    lines.push(healthcheck(cfg.port || '8080', '/'));
  }

  const cmd = cfg.startCmd || './server';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
