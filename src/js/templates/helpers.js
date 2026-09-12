export function buildBaseImage(name, tag) {
  if (tag) {
    return name + ':' + tag;
  }
  return name + ':latest';
}

export function envBlock(vars) {
  if (!vars || vars.length === 0) return '';
  return vars.map((v) => `ENV ${v.key}=${v.value}`).join('\n');
}

export function healthcheck(port, path) {
  return [
    'HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3',
    `  CMD curl -f http://localhost:${port}${path} || exit 1`,
  ].join('\n');
}
