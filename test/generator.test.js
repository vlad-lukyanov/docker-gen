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
  });

  it('should override defaults with provided config', () => {
    const cfg = getConfig({ language: 'python', port: '8000' });
    expect(cfg.language).toBe('python');
    expect(cfg.port).toBe('8000');
    expect(cfg.multiStage).toBe(true);
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
    const result = generateDockerfile({ language: 'node', baseImage: 'registry.example.com/my-node:1.2.3' });
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
});
