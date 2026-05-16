/**
 * Vietnam Fuel API
 * Author: Chí Dũng
 * Github: https://github.com/chidungho
 */
'use strict';

/* ==========================================================================
 * [ĐIỂM VÀO ỨNG DỤNG] Khởi động Vietnam Fuel API.
 * Xử lý: cấu hình Express, middleware, đăng ký route và lắng nghe cổng.
 * ========================================================================== */

require('dotenv').config();

const config = require('./config');
const logger = require('./utils/logger');
const { startJobs } = require('./workers/jobs');
const { createApp } = require('./server');

/* ==========================================================================
 * [CẤU HÌNH EXPRESS] Khởi tạo ứng dụng và middleware.
 * ========================================================================== */

async function bootstrap() {
  logger.info('[Bootstrap] Khởi động Vietnam Fuel API...');
  const app = createApp();

  // [JOBS] Khởi động tác vụ cào dữ liệu nền và cron.
  startJobs(config, logger);

  // [MÁY CHỦ] Dựng HTTP server cho JSON API.
  app.listen(config.port, () => {
    logger.info(`[Bootstrap] Server đang chạy tại http://localhost:${config.port}`);
    logger.info(`[Bootstrap] API: http://localhost:${config.port}/api/fuel-prices`);
  });
}

if (require.main === module) {
  bootstrap().catch((err) => {
    logger.error(`[Bootstrap] Lỗi nghiêm trọng: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { bootstrap };


