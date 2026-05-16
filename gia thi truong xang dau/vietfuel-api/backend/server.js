/**
 * Vietnam Fuel API
 * Author: Chí Dũng
 * Github: https://github.com/chidungho
 */
'use strict';

const path = require('path');

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const fuelRoutes = require('./routes/fuel');
const logger = require('./utils/logger');

function getFrontendIndexPath() {
  return path.join(__dirname, '..', '..', 'index.html');
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(compression());

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:'],
      },
    },
  }));

  app.disable('x-powered-by');

  app.use('/api', fuelRoutes);

  app.get(['/', '/index.html'], (_, res) => {
    res.set('Cache-Control', 'no-store');
    res.sendFile(getFrontendIndexPath());
  });

  app.use('/api', (_, res) => {
    res.status(404).json({
      success: false,
      status: 'not_found',
      message: { vi: 'Endpoint không tồn tại.', en: 'Endpoint not found.' },
    });
  });

  app.use((err, _, res, _next) => {
    logger.error(err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: { vi: 'Đã xảy ra lỗi máy chủ.', en: 'Internal server error.' },
    });
  });

  return app;
}

module.exports = {
  createApp,
  getFrontendIndexPath,
};
