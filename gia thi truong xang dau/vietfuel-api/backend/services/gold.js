/**
 * Vietnam Fuel API
 * Author: Chí Dũng
 * Github: https://github.com/chidungho
 */
'use strict';

const logger = require('../utils/logger');

const GOLD_API_URL = process.env.GOLD_API_URL || 'https://www.vang.today/api/prices';
const GOLD_API_DOCS_URL = 'https://www.vang.today/vi/api';
const GOLD_TTL_MS = (parseInt(process.env.GOLD_CACHE_TTL_SECONDS, 10) || 300) * 1000;

const GOLD_NAMES = {
  SJL1L10: 'Vàng SJC 9999',
  SJ9999: 'Vàng nhẫn SJC 9999',
  DOHNL: 'DOJI Hà Nội',
  DOHCML: 'DOJI TP.HCM',
  DOJINHTV: 'DOJI Nữ trang',
  BTSJC: 'Bảo Tín SJC',
  BT9999NTT: 'Bảo Tín 9999',
  PQHNVM: 'PNJ Hà Nội',
  PQHN24NTT: 'PNJ 24K',
  VNGSJC: 'VN Gold SJC',
  VIETTINMSJC: 'VietinBank SJC',
  XAUUSD: 'Vàng thế giới XAU/USD',
};

const PREFERRED_ORDER = [
  'SJL1L10',
  'SJ9999',
  'DOHNL',
  'DOHCML',
  'DOJINHTV',
  'BTSJC',
  'BT9999NTT',
  'PQHNVM',
  'PQHN24NTT',
  'VNGSJC',
  'VIETTINMSJC',
  'XAUUSD',
];

let cache = null;

function toUpdatedAt(timestamp) {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function normalizeGoldPayload(payload) {
  if (!payload || payload.success !== true) {
    throw new Error('Gold API returned an invalid payload.');
  }

  const entries = payload.prices
    ? Object.entries(payload.prices)
    : [[payload.type, payload]];

  const data = entries
    .map(([code, item]) => {
      const buy = Number(item.buy);
      const sell = Number(item.sell);
      const currency = item.currency || (code === 'XAUUSD' ? 'USD' : 'VND');

      if (!Number.isFinite(buy) || !Number.isFinite(sell)) return null;
      if (currency === 'VND' && (!buy || !sell)) return null;

      return {
        code,
        name: GOLD_NAMES[code] || item.name || code,
        buy,
        sell,
        changeBuy: Number(item.change_buy || 0),
        changeSell: Number(item.change_sell || 0),
        currency,
        unit: currency === 'VND' ? 'VND/lượng' : 'USD/oz',
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const ia = PREFERRED_ORDER.indexOf(a.code);
      const ib = PREFERRED_ORDER.indexOf(b.code);
      if (ia === -1 && ib === -1) return a.name.localeCompare(b.name, 'vi');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

  if (!data.length) {
    throw new Error('Gold API returned no usable prices.');
  }

  return {
    fetchedAt: new Date().toISOString(),
    updatedAt: toUpdatedAt(payload.timestamp),
    priceDate: payload.date || null,
    priceTime: payload.time || null,
    data,
  };
}

async function fetchGoldPrices({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.cachedAt < GOLD_TTL_MS) {
    return { ...cache.payload, cacheHit: true, cacheTtlRemainingSeconds: Math.ceil((GOLD_TTL_MS - (Date.now() - cache.cachedAt)) / 1000) };
  }

  const res = await fetch(GOLD_API_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'VietFuelBot/1.0 (Gold price API client)',
      'Cache-Control': 'no-cache',
    },
  });

  if (!res.ok) {
    throw new Error(`Gold API HTTP ${res.status}`);
  }

  const payload = normalizeGoldPayload(await res.json());
  cache = { cachedAt: Date.now(), payload };
  logger.info(`[Gold] Cập nhật ${payload.data.length} loại vàng. priceDate=${payload.priceDate || 'null'}`);

  return { ...payload, cacheHit: false, cacheTtlRemainingSeconds: Math.ceil(GOLD_TTL_MS / 1000) };
}

module.exports = {
  GOLD_API_URL,
  GOLD_API_DOCS_URL,
  fetchGoldPrices,
};
