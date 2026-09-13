import { describe, it, expect } from 'vitest';
import { generateDockerfile, getConfig, LANGUAGES } from '../src/js/generator.js';

describe('generator', () => {
  it('should export all 18 languages', () => {
    const keys = Object.keys(LANGUAGES);
    expect(keys).toEqual([
      'node',
      'python',
      'golang',
      'rust',
      'java',
      'php',
      'bun',
      'deno',
      'ruby',
      'dotnet',
      'nginx',
      'kotlin',
      'elixir',
      'scala',
      'gradle',
      'fastapi',
      'laravel',
      'react',
    ]);
  });

  it('should return default config', () => {
    const cfg = getConfig();
    expect(cfg.language).toBe('node');
    expect(cfg.multiStage).toBe(true);
    expect(cfg.alpine).toBe(true);
    expect(cfg.nonRoot).toBe(true);
    expect(cfg.healthcheck).toBe(false);
    expect(cfg.workDir).toBe('/app');
    expect(cfg.envVars).toEqual([]);
    expect(cfg.labels).toEqual([]);
    expect(cfg.volume).toBe('');
    expect(cfg.entrypoint).toBe('');
  });

  it('should override defaults with provided config', () => {
    const cfg = getConfig({ language: 'python', port: '8000' });
    expect(cfg.language).toBe('python');
    expect(cfg.port).toBe('8000');
    expect(cfg.multiStage).toBe(true);
  });

  it('should have defaultPort for every language', () => {
    for (const [, lang] of Object.entries(LANGUAGES)) {
      expect(lang.defaultPort).toBeTruthy();
      expect(typeof lang.defaultPort).toBe('string');
    }
  });

  it('should generate Dockerfile for each language', () => {
    for (const lang of Object.keys(LANGUAGES)) {
      const result = generateDockerfile({ language: lang });
      expect(result).toContain('FROM');
      expect(result).toContain('WORKDIR');
      expect(result).toContain('CMD');
    }
  });

  it('should handle unknown language', () => {
    const result = generateDockerfile({ language: 'unknown' });
    expect(result).toContain('Error');
  });

  it('should respect custom base image', () => {
    const result = generateDockerfile({
      language: 'node',
      baseImage: 'registry.example.com/my-node:1.2.3',
    });
    expect(result).toContain('FROM registry.example.com/my-node:1.2.3');
  });

  it('should include EXPOSE when port is set', () => {
    const result = generateDockerfile({ language: 'node', port: '3000' });
    expect(result).toContain('EXPOSE 3000');
  });

  it('should not include EXPOSE when port is empty', () => {
    const result = generateDockerfile({ language: 'node' });
    expect(result).not.toContain('EXPOSE');
  });

  it('should include HEALTHCHECK when enabled', () => {
    const result = generateDockerfile({ language: 'node', healthcheck: true, port: '3000' });
    expect(result).toContain('HEALTHCHECK');
    expect(result).toContain('curl');
  });

  it('should not include HEALTHCHECK when disabled', () => {
    const result = generateDockerfile({ language: 'node', healthcheck: false });
    expect(result).not.toContain('HEALTHCHECK');
  });

  it('should include non-root user when enabled', () => {
    const result = generateDockerfile({ language: 'node', nonRoot: true });
    expect(result).toContain('appuser');
    expect(result).toContain('USER');
  });

  it('should not include non-root user when disabled', () => {
    const result = generateDockerfile({ language: 'node', nonRoot: false });
    expect(result).not.toContain('USER appuser');
  });

  it('should include multi-stage build when enabled', () => {
    const result = generateDockerfile({ language: 'node', multiStage: true });
    expect(result).toContain('AS builder');
  });

  it('should not include multi-stage build when disabled', () => {
    const result = generateDockerfile({ language: 'node', multiStage: false });
    expect(result).not.toContain('AS builder');
  });

  it('should include ENV variables', () => {
    const result = generateDockerfile({
      language: 'node',
      envVars: [{ key: 'NODE_ENV', value: 'production' }],
    });
    expect(result).toContain('ENV NODE_ENV=production');
  });

  it('should include LABEL instructions', () => {
    const result = generateDockerfile({
      language: 'node',
      labels: [{ key: 'maintainer', value: 'docker-gen@example.com' }],
    });
    expect(result).toContain('LABEL maintainer=docker-gen@example.com');
  });

  it('should include VOLUME instructions', () => {
    const result = generateDockerfile({
      language: 'node',
      volume: '/data',
    });
    expect(result).toContain('VOLUME /data');
  });

  it('should support multiple VOLUME paths', () => {
    const result = generateDockerfile({
      language: 'node',
      volume: ['/data', '/cache'],
    });
    expect(result).toContain('VOLUME /data /cache');
  });

  it('should use custom start command', () => {
    const result = generateDockerfile({
      language: 'node',
      startCmd: 'npm start',
    });
    expect(result).toContain('npm start');
  });

  it('should use custom work directory', () => {
    const result = generateDockerfile({
      language: 'node',
      workDir: '/srv/app',
    });
    expect(result).toContain('WORKDIR /srv/app');
  });

  it('should include ENTRYPOINT when set', () => {
    const result = generateDockerfile({
      language: 'node',
      entrypoint: '/docker-entrypoint.sh',
    });
    expect(result).toContain('ENTRYPOINT ["/docker-entrypoint.sh"]');
    expect(result).not.toContain('CMD');
  });

  it('should include ENTRYPOINT and CMD when both set', () => {
    const result = generateDockerfile({
      language: 'node',
      entrypoint: '/docker-entrypoint.sh',
      startCmd: 'npm start',
    });
    expect(result).toContain('ENTRYPOINT ["/docker-entrypoint.sh"]');
    expect(result).toContain('CMD ["npm start"]');
  });

  it('should use default CMD when entrypoint and startCmd are empty', () => {
    const result = generateDockerfile({ language: 'node' });
    expect(result).toContain('CMD ["node server.js"]');
    expect(result).not.toContain('ENTRYPOINT');
  });
});
