import { buildBaseImage, envBlock, healthcheck } from './helpers.js';

export function dotnetTemplate(cfg) {
  const lines = [];
  const sdkTag = cfg.alpine ? '8.0-alpine' : '8.0';

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(`FROM ${buildBaseImage('mcr.microsoft.com/dotnet/sdk', sdkTag)} AS builder`);
    lines.push('WORKDIR /src');
    lines.push('');
    lines.push('COPY . .');
    lines.push('RUN dotnet restore');
    lines.push('RUN dotnet publish -c Release -o /app/publish');
    lines.push('');
    lines.push('# Production stage');
    lines.push(`FROM ${cfg.alpine ? 'mcr.microsoft.com/dotnet/aspnet:8.0-alpine' : 'mcr.microsoft.com/dotnet/aspnet:8.0'}`);
  } else {
    lines.push(`FROM ${buildBaseImage('mcr.microsoft.com/dotnet/aspnet', sdkTag)}`);
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
    lines.push('COPY --from=builder /app/publish .');
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
    lines.push(healthcheck(cfg.port || '8080', '/'));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('USER appuser');
  }

  const cmd = cfg.startCmd || 'dotnet app.dll';
  lines.push('');
  lines.push('CMD [' + JSON.stringify(cmd) + ']');

  return lines.join('\n');
}
