/**
 * VietFuel API
 * HTTP scraper for GiaXangHomNay.
 */
'use strict';

const config = require('../../config');
const {
  BOT_UA,
  parsePrice,
  deduplicate,
  toISODate,
  pickMostLikelyPriceDate,
} = require('./utils');

const FUEL_RE = /xăng|dầu|ron|do\b|diesel|hỏa|ko/i;

function decodeEntities(value = '') {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#9660;/g, '▼')
    .replace(/&#9650;/g, '▲')
    .replace(/&#128197;/g, '');
}

function cleanCell(value = '') {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRows(html, tableClass) {
  const tableRe = new RegExp(`<table\\b[^>]*class=["'][^"']*${tableClass}[^"']*["'][^>]*>([\\s\\S]*?)<\\/table>`, 'i');
  const table = html.match(tableRe)?.[1];
  if (!table) return [];

  return Array.from(table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi))
    .map((row) =>
      Array.from(row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi))
        .map((cell) => cleanCell(cell[1]))
        .filter(Boolean)
    )
    .filter((cells) => cells.length > 0);
}

function parseChange(raw) {
  const match = cleanCell(raw).replace(/[.,\s]/g, '').match(/[+-]?\d+/);
  return match ? Number(match[0]) : 0;
}

function normalizeFuelName(name) {
  if (/^dầu\s+ko$/i.test(name)) return 'Dầu hỏa 2-K';
  return name;
}

function pickPriceDate(html) {
  const candidates = [];
  const inputDate = html.match(/<input\b[^>]*id=["']vn_today["'][^>]*value=["'](\d{4}-\d{2}-\d{2})["']/i)?.[1];
  if (inputDate) candidates.push(inputDate);

  const plainText = cleanCell(html);
  const historyDate = plainText.match(/Lịch sử thay đổi giá xăng dầu\s+Ngày\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)?.[1]
    || plainText.match(/Ngày\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)?.[1];
  if (historyDate) candidates.push(historyDate);

  for (const raw of candidates) {
    const iso = toISODate(raw);
    if (iso) return iso;
  }

  const allDates = Array.from(plainText.matchAll(/(\d{1,2}\/\d{1,2}\/\d{4})/g)).map((m) => m[1]);
  return pickMostLikelyPriceDate(allDates, { maxAgeDays: 45, minYear: 2020 }) || inputDate || null;
}

function parsePetrolimexRows(html) {
  const rows = extractRows(html, 'table-petro');
  const prices = rows
    .filter((cells) => cells.length >= 5 && FUEL_RE.test(cells[0]))
    .map((cells) => ({
      name: normalizeFuelName(cells[0]),
      region1: parsePrice(cells[cells.length - 2]),
      region2: parsePrice(cells[cells.length - 1]),
      price: null,
      change: parseChange(cells[2] || cells[1]),
      unit: 'VND/lít',
    }))
    .filter((item) => item.region1 || item.region2);

  return deduplicate(prices);
}

function parsePvoilRows(html) {
  const rows = extractRows(html, 'table-pvoil');
  const prices = rows
    .filter((cells) => cells.length >= 4 && FUEL_RE.test(cells[0]))
    .map((cells) => ({
      name: normalizeFuelName(cells[0]),
      region1: null,
      region2: null,
      price: parsePrice(cells[cells.length - 1]),
      change: parseChange(cells[2] || cells[1]),
      unit: 'VND/lít',
    }))
    .filter((item) => item.price);

  return deduplicate(prices);
}

async function fetchHomeHtml() {
  const res = await fetch(config.scraper.giaxanghomnayUrl, {
    headers: {
      'User-Agent': BOT_UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
    },
  });

  if (!res.ok) {
    throw new Error(`GiaXangHomNay HTTP ${res.status}`);
  }

  return res.text();
}

async function scrapeGiaxanghomnayViaHttp() {
  const html = await fetchHomeHtml();
  const prices = parsePetrolimexRows(html);
  if (!prices.length) {
    throw new Error('Không tìm thấy bảng Petrolimex trong HTML GiaXangHomNay.');
  }

  return {
    prices,
    scrapedAt: new Date().toISOString(),
    source: config.scraper.giaxanghomnayUrl,
    priceDate: pickPriceDate(html),
    priceDateSource: 'gxhn-http',
  };
}

async function scrapePvoilViaHttp() {
  const html = await fetchHomeHtml();
  const prices = parsePvoilRows(html);
  if (!prices.length) {
    throw new Error('Không tìm thấy bảng PVOIL trong HTML GiaXangHomNay.');
  }

  return {
    prices,
    scrapedAt: new Date().toISOString(),
    source: config.scraper.giaxanghomnayUrl,
    priceDate: pickPriceDate(html),
    priceDateSource: 'pvoil-text',
    priceAnnouncedAt: null,
    _tier: 2,
  };
}

module.exports = {
  scrapeGiaxanghomnayViaHttp,
  scrapePvoilViaHttp,
  parsePetrolimexRows,
  parsePvoilRows,
  pickPriceDate,
};
