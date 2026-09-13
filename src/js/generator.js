import { templates } from './templates/index.js';

export const LANGUAGES = {
  node: { name: 'Node.js', icon: '⬢', defaultPort: '3000' },
  python: { name: 'Python', icon: '🐍', defaultPort: '8000' },
  golang: { name: 'Go', icon: '🔷', defaultPort: '8080' },
  rust: { name: 'Rust', icon: '🦀', defaultPort: '8080' },
  java: { name: 'Java', icon: '☕', defaultPort: '8080' },
  php: { name: 'PHP', icon: '🐘', defaultPort: '80' },
  bun: { name: 'Bun', icon: '🍞', defaultPort: '3000' },
  deno: { name: 'Deno', icon: '🦕', defaultPort: '8000' },
  ruby: { name: 'Ruby', icon: '💎', defaultPort: '3000' },
  dotnet: { name: '.NET', icon: '⚙️', defaultPort: '8080' },
  nginx: { name: 'Nginx', icon: '🌐', defaultPort: '80' },
  kotlin: { name: 'Kotlin', icon: '🧩', defaultPort: '8080' },
  elixir: { name: 'Elixir', icon: '💧', defaultPort: '4000' },
  scala: { name: 'Scala', icon: '🔺', defaultPort: '8080' },
  gradle: { name: 'Gradle', icon: '🧰', defaultPort: '8080' },
  fastapi: { name: 'FastAPI', icon: '⚡', defaultPort: '8000' },
  laravel: { name: 'Laravel', icon: '🪐', defaultPort: '8000' },
  react: { name: 'React', icon: '⚛️', defaultPort: '80' },
};

const DEFAULTS = {
  language: 'node',
  baseImage: '',
  port: '',
  workDir: '/app',
  startCmd: '',
  volume: '',
  multiStage: true,
  alpine: true,
  nonRoot: true,
  healthcheck: false,
  envVars: [],
  labels: [],
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
