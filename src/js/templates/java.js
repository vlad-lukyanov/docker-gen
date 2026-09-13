import {
  buildBaseImage,
  envBlock,
  healthcheck,
  labelBlock,
  volumeBlock,
  entrypointBlock,
} from './helpers.js';

export function javaTemplate(cfg) {
  const lines = [];

  if (cfg.multiStage) {
    lines.push('# Build stage');
    lines.push(
      `FROM ${buildBaseImage('eclipse-temurin', '17-' + (cfg.alpine ? 'alpine' : 'jammy'), cfg.baseImage)} AS builder`,
    );
    lines.push('WORKDIR /app');
    lines.push('');
    lines.push('COPY gradlew gradle.properties build.gradle settings.gradle ./');
    lines.push('COPY gradle ./gradle');
    lines.push('RUN ./gradlew dependencies --no-daemon');
    lines.push('');
    lines.push('COPY src ./src');
    lines.push('RUN ./gradlew bootJar --no-daemon');
    lines.push('');
    lines.push('# Production stage');
    lines.push(
      `FROM ${buildBaseImage('eclipse-temurin', '17-' + (cfg.alpine ? 'alpine' : 'jammy'), cfg.baseImage)}`,
    );
  } else {
    lines.push(
      `FROM ${buildBaseImage('eclipse-temurin', '17-' + (cfg.alpine ? 'alpine' : 'jammy'), cfg.baseImage)}`,
    );
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
    lines.push('COPY --from=builder /app/build/libs/*.jar app.jar');
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
    lines.push(healthcheck(cfg.port || '8080', '/actuator/health'));
  }

  if (cfg.nonRoot) {
    lines.push('');
    lines.push('USER appuser');
  }

  lines.push('');
  lines.push(entrypointBlock(cfg.entrypoint, cfg.startCmd, 'java -jar app.jar'));

  return lines.join('\n');
}
