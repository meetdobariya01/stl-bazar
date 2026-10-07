// utils/logger.js
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info;

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

const logger = {
  error: (msg, meta) => {
    if (currentLevel >= levels.error)
      console.error(formatMessage("error", msg, meta));
  },
  warn: (msg, meta) => {
    if (currentLevel >= levels.warn)
      console.warn(formatMessage("warn", msg, meta));
  },
  info: (msg, meta) => {
    if (currentLevel >= levels.info)
      console.log(formatMessage("info", msg, meta));
  },
  debug: (msg, meta) => {
    if (currentLevel >= levels.debug)
      console.log(formatMessage("debug", msg, meta));
  },
};

module.exports = logger;