import { generateDockerfile, getConfig, LANGUAGES } from './generator.js';

class ConfigPanel extends HTMLElement {
  constructor() {
    super();
    this._config = getConfig();
    this._listeners = [];
  }

  connectedCallback() {
    this.render();
    this._addListeners();
    this._sync();
  }

  disconnectedCallback() {
    this._listeners.forEach(([el, event, fn]) => el.removeEventListener(event, fn));
    this._listeners = [];
  }

  _listen(el, event, fn) {
    el.addEventListener(event, fn);
    this._listeners.push([el, event, fn]);
  }

  get config() {
    return this._config;
  }

  _sync() {
    this.dispatchEvent(
      new CustomEvent('config-change', {
        detail: { ...this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _addListeners() {
    this.querySelector('#language').addEventListener('change', (e) => {
      this._config.language = e.target.value;
      this._config.baseImage = '';
      this._config.startCmd = '';
      this._config.port = '';
      this._sync();
    });

    this.querySelector('#base-image').addEventListener('input', (e) => {
      this._config.baseImage = e.target.value;
      this._sync();
    });

    this.querySelector('#port').addEventListener('input', (e) => {
      this._config.port = e.target.value;
      this._sync();
    });

    this.querySelector('#work-dir').addEventListener('input', (e) => {
      this._config.workDir = e.target.value;
      this._sync();
    });

    this.querySelector('#start-cmd').addEventListener('input', (e) => {
      this._config.startCmd = e.target.value;
      this._sync();
    });

    this.querySelector('#multi-stage').addEventListener('change', (e) => {
      this._config.multiStage = e.target.checked;
      this._sync();
    });

    this.querySelector('#alpine').addEventListener('change', (e) => {
      this._config.alpine = e.target.checked;
      this._sync();
    });

    this.querySelector('#non-root').addEventListener('change', (e) => {
      this._config.nonRoot = e.target.checked;
      this._sync();
    });

    this.querySelector('#healthcheck').addEventListener('change', (e) => {
      this._config.healthcheck = e.target.checked;
      this._sync();
    });

    this.querySelector('#add-env').addEventListener('click', () => {
      this._config.envVars.push({ key: '', value: '' });
      this._renderEnvVars();
      this._sync();
    });

    this.querySelector('#add-label').addEventListener('click', () => {
      this._config.labels.push({ key: '', value: '' });
      this._renderLabels();
      this._sync();
    });
  }

  _renderEnvVars() {
    const container = this.querySelector('#env-list');
    container.innerHTML = this._config.envVars
      .map(
        (_, i) => `
      <div class="env-row" data-index="${i}">
        <input type="text" class="form-input" placeholder="KEY" value="${this._config.envVars[i].key}" data-field="key" data-index="${i}">
        <input type="text" class="form-input" placeholder="value" value="${this._config.envVars[i].value}" data-field="value" data-index="${i}">
        <button class="btn-remove-env" data-index="${i}" aria-label="Remove">×</button>
      </div>
    `,
      )
      .join('');

    container.querySelectorAll('.form-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        this._config.envVars[idx][field] = e.target.value;
        this._sync();
      });
    });

    container.querySelectorAll('.btn-remove-env').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this._config.envVars.splice(idx, 1);
        this._renderEnvVars();
        this._sync();
      });
    });
  }

  _renderLabels() {
    const container = this.querySelector('#label-list');
    container.innerHTML = this._config.labels
      .map(
        (_, i) => `
      <div class="env-row" data-index="${i}">
        <input type="text" class="form-input" placeholder="KEY" value="${this._config.labels[i].key}" data-field="key" data-index="${i}">
        <input type="text" class="form-input" placeholder="value" value="${this._config.labels[i].value}" data-field="value" data-index="${i}">
        <button class="btn-remove-env" data-index="${i}" aria-label="Remove">×</button>
      </div>
    `,
      )
      .join('');

    container.querySelectorAll('.form-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        this._config.labels[idx][field] = e.target.value;
        this._sync();
      });
    });

    container.querySelectorAll('.btn-remove-env').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this._config.labels.splice(idx, 1);
        this._renderLabels();
        this._sync();
      });
    });
  }

  render() {
    const langOptions = Object.entries(LANGUAGES)
      .map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`)
      .join('');

    this.innerHTML = `
      <div class="config-panel">
        <div class="panel-section">
          <div class="panel-section-title">Language</div>
          <div class="form-group">
            <select id="language" class="form-select">${langOptions}</select>
          </div>
        </div>

        <div class="divider"></div>

        <div class="panel-section">
          <div class="panel-section-title">Base Image</div>
          <div class="form-group">
            <input type="text" id="base-image" class="form-input" placeholder="Auto-detect (e.g., node:20-alpine)">
          </div>
        </div>

        <div class="divider"></div>

        <div class="panel-section">
          <div class="panel-section-title">Build Options</div>
          <div class="toggle-row">
            <span class="toggle-label">Multi-stage build</span>
            <label class="toggle">
              <input type="checkbox" id="multi-stage" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Alpine / slim variant</span>
            <label class="toggle">
              <input type="checkbox" id="alpine" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Non-root user</span>
            <label class="toggle">
              <input type="checkbox" id="non-root" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">HEALTHCHECK</span>
            <label class="toggle">
              <input type="checkbox" id="healthcheck">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="divider"></div>

        <div class="panel-section">
          <div class="panel-section-title">Configuration</div>
          <div class="form-group">
            <label class="form-label" for="port">Exposed Port</label>
            <input type="text" id="port" class="form-input" placeholder="e.g., 3000">
          </div>
          <div class="form-group">
            <label class="form-label" for="work-dir">Working Directory</label>
            <input type="text" id="work-dir" class="form-input" value="/app">
          </div>
          <div class="form-group">
            <label class="form-label" for="start-cmd">Start Command</label>
            <input type="text" id="start-cmd" class="form-input" placeholder="Auto-detect">
          </div>
        </div>

        <div class="divider"></div>

        <div class="panel-section">
          <div class="panel-section-title">Environment Variables</div>
          <div id="env-list" class="env-list"></div>
          <button id="add-env" class="btn-add-env">+ Add variable</button>
        </div>

        <div class="divider"></div>

        <div class="panel-section">
          <div class="panel-section-title">Labels</div>
          <div id="label-list" class="env-list"></div>
          <button id="add-label" class="btn-add-env">+ Add label</button>
        </div>
      </div>
    `;
  }
}

class PreviewPanel extends HTMLElement {
  constructor() {
    super();
    this._dockerfile = '';
  }

  connectedCallback() {
    this.render();
    document.addEventListener('config-change', (e) => {
      this._dockerfile = generateDockerfile(e.detail);
      this._updateCode();
    });
    this._dockerfile = generateDockerfile(getConfig());
    this._updateCode();
  }

  render() {
    this.innerHTML = `
      <div class="preview-toolbar">
        <span class="preview-filename">Dockerfile</span>
        <div class="preview-actions">
          <button id="copy-btn" class="btn btn-primary">📋 Copy</button>
          <button id="download-btn" class="btn btn-secondary">⬇ Download</button>
        </div>
      </div>
      <div class="code-container">
        <div class="code-header">
          <span class="code-dot red"></span>
          <span class="code-dot yellow"></span>
          <span class="code-dot green"></span>
          <span class="code-title">Dockerfile</span>
        </div>
        <div class="code-content">
          <pre id="code-output"></pre>
        </div>
      </div>
    `;

    this.querySelector('#copy-btn').addEventListener('click', () => this._copy());
    this.querySelector('#download-btn').addEventListener('click', () => this._download());
  }

  _updateCode() {
    const el = this.querySelector('#code-output');
    if (el) {
      el.textContent = this._dockerfile;
    }
  }

  async _copy() {
    try {
      await navigator.clipboard.writeText(this._dockerfile);
      this._showToast('Copied to clipboard!');
    } catch {
      this._showToast('Failed to copy');
    }
  }

  _download() {
    const blob = new Blob([this._dockerfile], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    a.click();
    URL.revokeObjectURL(url);
    this._showToast('Downloaded!');
  }

  _showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
}

customElements.define('config-panel', ConfigPanel);
customElements.define('preview-panel', PreviewPanel);

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
