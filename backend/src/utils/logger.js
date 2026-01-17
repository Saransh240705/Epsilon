const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  http: '\x1b[35m',
  debug: '\x1b[32m',
  reset: '\x1b[0m'
};

const formatMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const color = colors[level] || colors.reset;
  const formattedArgs = args.length > 0 
    ? ' ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
    : '';
  
  return `${color}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message}${formattedArgs}`;
};

const shouldLog = (level) => {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
};

export const logger = {
  error: (message, ...args) => {
    if (shouldLog('error')) console.error(formatMessage('error', message, ...args));
  },
  warn: (message, ...args) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, ...args));
  },
  info: (message, ...args) => {
    if (shouldLog('info')) console.log(formatMessage('info', message, ...args));
  },
  http: (message, ...args) => {
    if (shouldLog('http')) console.log(formatMessage('http', message, ...args));
  },
  debug: (message, ...args) => {
    if (shouldLog('debug')) console.log(formatMessage('debug', message, ...args));
  }
};
