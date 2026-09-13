export function buildBaseImage(name, tag, baseImage = '') {
  if (baseImage) {
    return baseImage;
  }

  if (tag) {
    return name + ':' + tag;
  }

  return name + ':latest';
}

export function envBlock(vars) {
  if (!vars || vars.length === 0) return '';
  return vars.map((v) => `ENV ${v.key}=${v.value}`).join('\n');
}

export function labelBlock(labels) {
  if (!labels || labels.length === 0) return '';
  return labels.map((v) => `LABEL ${v.key}=${v.value}`).join('\n');
}

export function volumeBlock(volume) {
  if (!volume) return '';

  const volumes = Array.isArray(volume)
    ? volume
    : String(volume)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);

  if (volumes.length === 0) return '';

  return `VOLUME ${volumes.join(' ')}`;
}

export function healthcheck(port, path) {
  return [
    'HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3',
    `  CMD curl -f http://localhost:${port}${path} || exit 1`,
  ].join('\n');
}

export function entrypointBlock(entrypoint, startCmd, defaultCmd) {
  const lines = [];

  if (entrypoint) {
    lines.push('ENTRYPOINT [' + JSON.stringify(entrypoint) + ']');
    if (startCmd) {
      lines.push('CMD [' + JSON.stringify(startCmd) + ']');
    }
  } else {
    const cmd = startCmd || defaultCmd;
    lines.push('CMD [' + JSON.stringify(cmd) + ']');
  }

  return lines.join('\n');
}
