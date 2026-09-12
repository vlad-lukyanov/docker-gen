# 🐳 Dockerfile Generator

Generate production-ready Dockerfiles with best practices. Zero runtime dependencies.

## Features

- **6 languages**: Node.js, Python, Go, Rust, Java, PHP
- **Best practices**: Multi-stage builds, non-root users, layer caching, health checks
- **Alpine/slim support**: Smaller images by default
- **Live preview**: Real-time Dockerfile generation
- **Dark/light theme**: Automatic based on system preference
- **Zero dependencies**: Pure vanilla JavaScript

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:8080` in your browser.

## Usage

1. Select your language from the dropdown
2. Configure build options (multi-stage, alpine, non-root, healthcheck)
3. Set exposed port, working directory, and start command
4. Add environment variables as needed
5. Copy or download the generated Dockerfile

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

## Deployment

Automatically deployed to GitHub Pages on push to `master` via GitHub Actions.

## Tech Stack

- Vanilla JavaScript (Web Components)
- Plain CSS (CSS variables for theming)
- Vite (build tool)
- Vitest (testing)

## License

MIT
