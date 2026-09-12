# AGENTS.md — AI Agent Development Guide

## Project Overview

**docker-gen** is a static site that generates production-ready Dockerfiles with best practices. Zero runtime dependencies, vanilla JS + Web Components, built with Vite.

## Tech Stack

- **Runtime**: Vanilla JavaScript (ES modules)
- **UI**: Web Components (Custom Elements v1)
- **Styling**: Plain CSS with CSS custom properties
- **Build**: Vite 6
- **Test**: Vitest 3
- **Lint**: ESLint 9 + Prettier 3
- **Deploy**: GitHub Actions → GitHub Pages

## Commands

```bash
npm run dev          # Dev server at localhost:8080
npm run build        # Production build to dist/
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint src/ and test/
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
```

## Project Structure

```
src/
  index.html          # Entry point
  css/style.css       # All styles, CSS variables for theming
  js/
    app.js            # Web Components + theme toggle
    generator.js      # Core generation engine + config
    templates/        # Language-specific Dockerfile templates
      index.js        # Template registry
      helpers.js      # Shared helpers (base images, env, healthcheck)
      node.js
      python.js
      golang.js
      rust.js
      java.js
      php.js
test/
  generator.test.js   # Engine unit tests
  templates.test.js   # Template unit tests
```

## Code Conventions

- **No framework** — use native Web Components (`customElements.define`)
- **No build-time transpilation** — keep code as vanilla ES modules
- **Single responsibility** — one concern per file
- **Pure functions** — templates are `(config) => string`
- **CSS variables** — all colors/themes via `--var` in `:root` and `[data-theme="dark"]`
- **ESM only** — `type: "module"` in package.json

## Adding a New Language Template

1. Create `src/js/templates/<lang>.js`
2. Export `function <lang>Template(config) { ... }`
3. Import and register in `src/js/templates/index.js`
4. Add entry to `LANGUAGES` in `src/js/generator.js`
5. Add tests in `test/templates.test.js`

## Config Object Shape

```js
{
  language: 'node',        // one of: node, python, golang, rust, java, php
  baseImage: '',           // custom base image (empty = auto)
  port: '',                // exposed port (empty = no EXPOSE)
  workDir: '/app',         // WORKDIR path
  startCmd: '',            // custom CMD (empty = language default)
  multiStage: true,        // multi-stage build
  alpine: true,            // use alpine/slim variant
  nonRoot: true,           // add non-root user
  healthcheck: false,      // add HEALTHCHECK instruction
  envVars: [],             // [{ key: 'FOO', value: 'bar' }]
}
```

## Dockerfile Best Practices (enforce in templates)

- Always pin base image versions (no `latest` unless alpine=false)
- Combine RUN commands to reduce layers
- Clean package manager cache (`rm -rf /var/lib/apt/lists/*`)
- Copy dependency files before source (layer caching)
- Use multi-stage builds to reduce final image size
- Run as non-root user (UID > 10000)
- Set HEALTHCHECK when port is known
- Order: least-frequently-changing instructions first

## Testing

- Tests use Vitest with `globals: true` (no import needed for `describe`/`it`/`expect`)
- Each template has its own describe block
- Test all config permutations: multi-stage on/off, alpine on/off, port/no-port, custom cmd

## Theming

- Light/dark via `data-theme` attribute on `<html>`
- Toggle stored in `localStorage`
- All colors defined as CSS variables in `:root` and `[data-theme="dark"]`

## Common Pitfalls

- Do NOT use `fetch()` or dynamic imports in templates
- Do NOT add runtime dependencies — keep bundle at 0 deps
- Do NOT use `innerHTML` with user input (XSS risk) — use `textContent` for code output
- Do NOT modify `config` objects directly — always spread/clone
