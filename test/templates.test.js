import { describe, it, expect } from 'vitest';
import { nodeTemplate } from '../src/js/templates/node.js';
import { pythonTemplate } from '../src/js/templates/python.js';
import { golangTemplate } from '../src/js/templates/golang.js';
import { rustTemplate } from '../src/js/templates/rust.js';
import { javaTemplate } from '../src/js/templates/java.js';
import { phpTemplate } from '../src/js/templates/php.js';

const baseCfg = {
  baseImage: '',
  port: '',
  workDir: '/app',
  startCmd: '',
  multiStage: true,
  alpine: true,
  nonRoot: true,
  healthcheck: false,
  envVars: [],
};

describe('node template', () => {
  it('should generate multi-stage build by default', () => {
    const result = nodeTemplate(baseCfg);
    expect(result).toContain('FROM node:alpine AS builder');
    expect(result).toContain('FROM node:alpine');
    expect(result).toContain('COPY --from=builder');
  });

  it('should generate single-stage build when multiStage is false', () => {
    const result = nodeTemplate({ ...baseCfg, multiStage: false });
    expect(result).not.toContain('AS builder');
    expect(result).not.toContain('COPY --from=builder');
  });

  it('should use latest tag when alpine is false', () => {
    const result = nodeTemplate({ ...baseCfg, alpine: false });
    expect(result).toContain('FROM node:latest');
  });

  it('should include custom port', () => {
    const result = nodeTemplate({ ...baseCfg, port: '8080' });
    expect(result).toContain('EXPOSE 8080');
  });

  it('should include custom start command', () => {
    const result = nodeTemplate({ ...baseCfg, startCmd: 'npm run dev' });
    expect(result).toContain('npm run dev');
  });
});

describe('python template', () => {
  it('should generate multi-stage build', () => {
    const result = pythonTemplate(baseCfg);
    expect(result).toContain('FROM python:slim AS builder');
    expect(result).toContain('pip install');
  });

  it('should use slim tag when alpine is true', () => {
    const result = pythonTemplate({ ...baseCfg, alpine: true });
    expect(result).toContain('python:slim');
  });

  it('should use latest tag when alpine is false', () => {
    const result = pythonTemplate({ ...baseCfg, alpine: false });
    expect(result).toContain('python:latest');
  });
});

describe('golang template', () => {
  it('should generate multi-stage build', () => {
    const result = golangTemplate(baseCfg);
    expect(result).toContain('FROM golang:alpine AS builder');
    expect(result).toContain('CGO_ENABLED=0');
  });

  it('should use distroless in production stage', () => {
    const result = golangTemplate({ ...baseCfg, alpine: false });
    expect(result).toContain('distroless/static-debian12');
  });

  it('should use alpine in production stage when alpine is true', () => {
    const result = golangTemplate({ ...baseCfg, alpine: true });
    expect(result).toContain('alpine:latest');
  });
});

describe('rust template', () => {
  it('should generate multi-stage build', () => {
    const result = rustTemplate(baseCfg);
    expect(result).toContain('FROM rust:alpine AS builder');
    expect(result).toContain('cargo build --release');
  });

  it('should include ca-certificates in alpine production stage', () => {
    const result = rustTemplate({ ...baseCfg, alpine: true });
    expect(result).toContain('ca-certificates');
  });
});

describe('java template', () => {
  it('should generate multi-stage build', () => {
    const result = javaTemplate(baseCfg);
    expect(result).toContain('FROM eclipse-temurin:17-alpine AS builder');
    expect(result).toContain('gradlew');
  });

  it('should use non-alpine when alpine is false', () => {
    const result = javaTemplate({ ...baseCfg, alpine: false });
    expect(result).toContain('eclipse-temurin:17-jammy');
  });
});

describe('php template', () => {
  it('should generate single-stage build', () => {
    const result = phpTemplate(baseCfg);
    expect(result).toContain('FROM php:alpine');
    expect(result).not.toContain('AS builder');
  });

  it('should install php extensions', () => {
    const result = phpTemplate(baseCfg);
    expect(result).toContain('docker-php-ext-install');
  });
});

describe('helpers', () => {
  it('should handle env block with multiple vars', () => {
    const cfg = {
      ...baseCfg,
      envVars: [
        { key: 'FOO', value: 'bar' },
        { key: 'BAZ', value: 'qux' },
      ],
    };
    const result = nodeTemplate(cfg);
    expect(result).toContain('ENV FOO=bar');
    expect(result).toContain('ENV BAZ=qux');
  });

  it('should generate healthcheck with custom port', () => {
    const result = nodeTemplate({ ...baseCfg, healthcheck: true, port: '4000' });
    expect(result).toContain('localhost:4000');
  });
});
