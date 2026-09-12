import { templates } from './templates/index.js';

export const LANGUAGES = {
  node: { name: 'Node.js', icon: '⬢' },
  python: { name: 'Python', icon: '🐍' },
  golang: { name: 'Go', icon: '🔷' },
  rust: { name: 'Rust', icon: '🦀' },
  java: { name: 'Java', icon: '☕' },
  php: { name: 'PHP', icon: '🐘' },
};

const DEFAULTS = {
  language: 'node',
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

export function getConfig(config) {
  return { ...DEFAULTS, ...config };
}

export function generateDockerfile(config) {
  const cfg = getConfig(config);
  const template = templates[cfg.language];
  if (!template) {
    return `# Error: Unknown language "${cfg.language}"`;
  }
  return template(cfg);
}

export function getDefaults() {
  return { ...DEFAULTS };
}
