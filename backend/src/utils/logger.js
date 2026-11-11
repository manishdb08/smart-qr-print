const SENSITIVE_KEYS = ['key', 'api_key', 'apikey', 'secret', 'password', 'token', 'authorization', 'bearer'];

function redactSensitiveData(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data !== 'object') {
    return data;
  }

  const sanitized = Array.isArray(data) ? [] : {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k));
    if (isSensitive && typeof value === 'string') {
      sanitized[key] = value.length > 8 ? `${value.slice(0, 4)}...[REDACTED]...${value.slice(-4)}` : '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const logger = {
  info: (message, meta) => {
    const ts = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(redactSensitiveData(meta))}` : '';
    console.log(`[${ts}] [INFO] ${message}${metaStr}`);
  },
  warn: (message, meta) => {
    const ts = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(redactSensitiveData(meta))}` : '';
    console.warn(`[${ts}] [WARN] ${message}${metaStr}`);
  },
  error: (message, meta) => {
    const ts = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(redactSensitiveData(meta))}` : '';
    console.error(`[${ts}] [ERROR] ${message}${metaStr}`);
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      const ts = new Date().toISOString();
      const metaStr = meta ? ` | ${JSON.stringify(redactSensitiveData(meta))}` : '';
      console.debug(`[${ts}] [DEBUG] ${message}${metaStr}`);
    }
  }
};

module.exports = logger;
