/**
 * Vietnam Fuel API
 * Author: Chí Dũng
 * Github: https://github.com/chidungho
 */
'use strict';

/* ==========================================================================
 * [LOGGER UTILITY] - Hệ thống ghi log (Winston)
 * Cấu hình ghi log ra console và file với các mức phân quyền.
 * ========================================================================== */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const isVercel = process.env.VERCEL === '1';

/**
 * Định dạng cơ bản cho các bản ghi log.
 */
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

/**
 * Đối tượng Winston Logger được cấu hình sẵn.
 * Sử dụng: logger.info(), logger.error(), logger.warn()...
 * @type {import('winston').Logger}
 */
const loggerTransports = [
  new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
  }),
];

if (!isVercel) {
  loggerTransports.push(
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: loggerTransports,
  // 5. Bắt các Uncaught Exceptions
  exceptionHandlers: isVercel
    ? [new transports.Console()]
    : [new transports.File({ filename: 'logs/exceptions.log' })],
});

module.exports = logger;

