/* ===================================================
   FinFlow.vn — script.js
   Pure Vanilla JavaScript — No dependencies
   =================================================== */

'use strict';

// ====================================================
// FALLBACK DATA
// ====================================================

const DATA = {
  gold: [
    { name: 'Vàng SJC 1L, 10L', buy: 118500, sell: 119000 },
    { name: 'Vàng SJC 1 chỉ, 2 chỉ, 5 chỉ', buy: 118500, sell: 119000 },
    { name: 'Vàng nhẫn SJC 99.99', buy: 114000, sell: 115400 },
    { name: 'Vàng nhẫn DOJI 99.99', buy: 113800, sell: 115200 },
  ],

  fuel: [
    { name: 'Xăng RON95-V', price: 23050, change: -200, date: getDate() },
    { name: 'Xăng E5 RON92-II', price: 22620, change: -100, date: getDate() },
    { name: 'Dầu diesel 0.001S-II', price: 20440, change: +50, date: getDate() },
    { name: 'Dầu hỏa 2-K', price: 19450, change: 0, date: getDate() },
  ],

  forex: [
    { currency: 'USD', cash: 25410, transfer: 25460, sell: 25770 },
    { currency: 'EUR', cash: 27880, transfer: 28020, sell: 29260 },
    { currency: 'JPY', cash: 166, transfer: 167, sell: 174 },
    { currency: 'GBP', cash: 32400, transfer: 32680, sell: 33970 },
    { currency: 'CNY', cash: 3430, transfer: 3460, sell: 3580 },
    { currency: 'SGD', cash: 18600, transfer: 18720, sell: 19380 },
  ],

  stocks: {
    up: [
      { code: 'VCB', price: 88200, change: +3.8, volume: 12.4 },
      { code: 'VHM', price: 43150, change: +3.5, volume: 8.7 },
      { code: 'HPG', price: 28700, change: +2.9, volume: 22.1 },
      { code: 'MWG', price: 63500, change: +2.4, volume: 5.3 },
    ],
    down: [
      { code: 'SSI',  price: 26800, change: -3.2, volume: 15.6 },
      { code: 'VND',  price: 15200, change: -2.8, volume: 10.9 },
      { code: 'CTG',  price: 33400, change: -1.9, volume: 9.2  },
      { code: 'BID',  price: 44900, change: -1.5, volume: 7.8  },
    ],
    liquid: [
      { code: 'HPG',  price: 28700, change: +2.9, volume: 48.3 },
      { code: 'STB',  price: 33100, change: +0.6, volume: 41.2 },
      { code: 'TCB',  price: 26200, change: -0.4, volume: 37.8 },
      { code: 'VCI',  price: 30500, change: +1.1, volume: 35.5 },
    ],
  },

  rates: [
    { term: '1 tháng', rate: 3.10, bank: 'VCB' },
    { term: '3 tháng', rate: 3.50, bank: 'VCB' },
    { term: '6 tháng', rate: 4.70, bank: 'VCB' },
    { term: '12 tháng', rate: 5.30, bank: 'VCB' },
    { term: '18 tháng', rate: 5.50, bank: 'Techcombank' },
    { term: '24 tháng', rate: 5.60, bank: 'Techcombank' },
  ],

  indices: [
    { name: 'VN-Index', value: 1284.75, change: +10.53, pct: +0.82 },
    { name: 'HNX-Index', value: 225.34,  change: +1.87,  pct: +0.84 },
    { name: 'UPCOM-Index', value: 93.41, change: -0.22,  pct: -0.24 },
  ],

  ticker: [
    { label: 'Vàng SJC', value: '119.000', change: '+0,45%', dir: 'up' },
    { label: 'Xăng RON95', value: '23.050', change: '-0,86%', dir: 'down' },
    { label: 'VN-Index', value: '1.284,75', change: '+0,82%', dir: 'up' },
    { label: 'USD/VND', value: '25.460', change: '+0,12%', dir: 'up' },
  ],
};

// Chart data seeds per type and period
const CHART_SEEDS = {
  gold:    { base: 117000, range: 3500, unit: 'đ/lượng', label: 'Giá Vàng SJC', val: '119.000', ch: '+450 (+0,38%)' },
  fuel:    { base: 22200,  range: 1200, unit: 'đ/lít',  label: 'Giá Xăng RON95', val: '23.050', ch: '-200 (-0,86%)' },
  vnindex: { base: 1240,   range: 80,   unit: 'điểm',   label: 'VN-Index', val: '1.284,75', ch: '+10,53 (+0,82%)' },
};

const PERIODS = { '1d': 12, '7d': 14, '1m': 16, '1y': 20 };
const PERIOD_LABELS = {
  '1d':    ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','ATC'],
  '7d':    ['T2','T3','T4','T5','T6','T7','T2','T3','T4','T5','T6','T7','T2','T4'],
  '1m':    ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16'],
  '1y':    ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T1','T2','T3','T4','T5','T6','T7','T8'],
};

// Track current chart state
let currentChart  = 'gold';
let currentPeriod = '1d';
let currentStockTab = 'up';

// ====================================================
// UTILITY FUNCTIONS
// ====================================================

/** Format number with thousand separator (VN style) */
function fmt(n) {
  return n.toLocaleString('vi-VN');
}

/** Get current time string HH:mm:ss */
function getTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour12: false });
}

/** Get current date string DD/MM/YYYY */
function getDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function getBackendApiBaseUrl() {
  const isBackendPage = window.location.protocol.startsWith('http') && window.location.port === '3000';
  return isBackendPage ? '/api' : 'http://localhost:3000/api';
}

function apiEndpoint(path) {
  return `${getBackendApiBaseUrl()}${path}`;
}

function displayGoldUnit(item = {}) {
  return item.unit === 'USD/oz' ? 'USD/oz' : 'đ/lượng';
}

function displayFuelUnit(item = {}) {
  return item.unit && item.unit !== 'VND/lít' ? item.unit : 'đ/lít';
}

function pctText(delta, base) {
  if (!base || !delta) return '0,00%';
  const pct = (delta / base) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(2).replace('.', ',')}%`;
}

/** Return class name based on direction */
function dirClass(val) {
  if (val > 0) return 'up';
  if (val < 0) return 'down';
  return '';
}

/** Format change with sign */
function fmtChange(val, suffix = '%') {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val}${suffix}`;
}

/** Slightly randomise a value by ±range */
function jitter(val, range) {
  return val + Math.round((Math.random() * 2 - 1) * range);
}

/** Generate a smooth random chart path */
function generatePath(seed, points) {
  const { base, range } = seed;
  const arr = [];
  let cur = base + jitter(0, range * 0.3);
  for (let i = 0; i < points; i++) {
    cur = Math.max(base - range, Math.min(base + range, cur + jitter(0, range * 0.15)));
    arr.push(cur);
  }
  return arr;
}

/** Convert data array to SVG path (800×200 viewBox) */
function toSVGPath(data, W = 800, H = 200, pad = 20) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const scaleX = (W - pad * 2) / (data.length - 1);
  const scaleY = max === min ? 1 : (H - pad * 2) / (max - min);
  const points = data.map((v, i) => {
    const x = pad + i * scaleX;
    const y = H - pad - (v - min) * scaleY;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return {
    line: `M${points.join(' L')}`,
    area: `M${points.join(' L')} L${(pad + (data.length - 1) * scaleX).toFixed(1)},${H} L${pad},${H} Z`,
  };
}

// ====================================================
// INTERACTIVE CHART SWITCHING & SCROLL LOCK
// ====================================================

let __savedScrollY = 0;
function lockBodyScroll() {
  __savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${__savedScrollY}px`;
}

function unlockBodyScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, __savedScrollY || 0);
}

function updateChartByItem(section, item) {
  if (!item) return;
  const prefix = section;
  const lineEl = document.getElementById(`${prefix}ChartLine`);
  const areaEl = document.getElementById(`${prefix}ChartArea`);
  const titleEl = document.getElementById(`${prefix}ChartTitle`);
  const valEl = document.getElementById(`${prefix}ChartCurrentVal`);
  const changeEl = document.getElementById(`${prefix}ChartChange`);
  if (!lineEl || !areaEl) return;

  // Derive seed from item
  let base = 0, range = 50, unit = '', label = '', valText = '', chText = '';
  if (item.sell !== undefined) { base = item.sell; range = Math.max(100, Math.round(base * 0.03)); unit = displayGoldUnit(item); label = item.name || item.code; valText = `${fmt(item.sell)} ${unit}`; chText = item.changeSell ? fmtChange(item.changeSell, ' đ') : (item.sell - item.buy ? `+${fmt(item.sell - item.buy)}` : '');
  } else if (item.price !== undefined) { base = item.price; range = Math.max(50, Math.round(base * 0.03)); unit = 'đ/lít'; label = item.name; valText = `${fmt(item.price)} ${unit}`; chText = item.change !== undefined ? fmtChange(item.change, ' đ') : ''; }
  else if (item.price === undefined && item.value !== undefined) { base = item.value; range = Math.max(10, Math.round(base * 0.03)); unit = ''; label = item.name; valText = `${item.value}`; chText = item.change !== undefined ? fmtChange(item.change) : ''; }

  const seed = { base: Math.max(1, Math.round(base)), range: Math.max(1, Math.round(range)), unit: unit, label: label || '', val: valText || '', ch: chText || '' };
  const pts = generatePath(seed, 12);
  const { line, area } = toSVGPath(pts, 800, 200);
  lineEl.setAttribute('d', line);
  areaEl.setAttribute('d', area);

  if (titleEl) titleEl.textContent = seed.label;
  if (valEl) valEl.textContent = seed.val;
  if (changeEl) {
    changeEl.textContent = seed.ch || '';
    changeEl.className = `chart-change ${seed.ch && seed.ch.startsWith('+') ? 'up' : seed.ch && seed.ch.startsWith('-') ? 'down' : ''}`;
  }
}

function setupChartSwitching() {
  // Attach to table rows with data-section/data-index
  document.querySelectorAll('table.data-table tbody tr[data-section][data-index]').forEach(row => {
    row.addEventListener('click', (e) => {
      const section = row.dataset.section;
      const idx = parseInt(row.dataset.index, 10);
      if (!section || isNaN(idx)) return;
      // clear previous active
      document.querySelectorAll(`table.data-table tbody tr[data-section="${section}"]`).forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      // find item
      const item = (section === 'gold' ? DATA.gold : section === 'fuel' ? DATA.fuel : section === 'stock' ? (DATA.stocks && DATA.stocks[currentStockTab] && DATA.stocks[currentStockTab][idx]) : null) || (DATA[section] && DATA[section][idx]);
      updateChartByItem(section, item);
    });
  });

  // mobile card lists: use click on .mc-row inside mobile lists
  document.querySelectorAll('.mobile-card-list').forEach(list => {
    Array.from(list.children).forEach((el, i) => {
      el.addEventListener('click', () => {
        // try to infer section from parent id
        const pid = list.id || '';
        let section = '';
        if (pid.includes('gold')) section = 'gold';
        if (pid.includes('fuel')) section = 'fuel';
        if (!section) return;
        // toggle active
        Array.from(list.children).forEach(ch => ch.classList.remove('active'));
        el.classList.add('active');
        const item = DATA[section] && DATA[section][i];
        updateChartByItem(section, item);
      });
    });
  });
}

function activateFirstMarketRows() {
  const gFirst = document.querySelector('table#goldTable tbody tr[data-section="gold"][data-index="0"]');
  const fFirst = document.querySelector('table#fuelTable tbody tr[data-section="fuel"][data-index="0"]');
  if (gFirst && DATA.gold[0]) {
    gFirst.classList.add('active');
    updateChartByItem('gold', DATA.gold[0]);
  }
  if (fFirst && DATA.fuel[0]) {
    fFirst.classList.add('active');
    updateChartByItem('fuel', DATA.fuel[0]);
  }
}


// ====================================================
// RENDER FUNCTIONS
// ====================================================

/** Render quick overview cards */
function renderQuickOverview() {
  const grid = document.getElementById('quickOverviewGrid');
  if (!grid) return;
  grid.innerHTML = DATA.ticker.map(t => `
    <article class="quick-card">
      <div class="quick-card-label">${t.label}</div>
      <div class="quick-card-value">${t.value}</div>
      <div class="quick-card-row">
        <span class="quick-card-change ${t.dir}">${t.change}</span>
        <span class="quick-card-badge">● Đang cập nhật</span>
      </div>
    </article>
  `).join('');
}

function drawSectionChart(type, prefix) {
  const seed = CHART_SEEDS[type];
  if (!seed) return;

  const data = generatePath(seed, 12);
  const { line, area } = toSVGPath(data, 800, 200);
  const lineEl = document.getElementById(`${prefix}ChartLine`);
  const areaEl = document.getElementById(`${prefix}ChartArea`);
  const labelsEl = document.getElementById(`${prefix}ChartXLabels`);
  const titleEl = document.getElementById(`${prefix}ChartTitle`);
  const valEl = document.getElementById(`${prefix}ChartCurrentVal`);
  const changeEl = document.getElementById(`${prefix}ChartChange`);

  if (lineEl) lineEl.setAttribute('d', line);
  if (areaEl) areaEl.setAttribute('d', area);

  if (labelsEl) {
    const labels = PERIOD_LABELS['1d'];
    const step = Math.max(1, Math.floor(labels.length / 6));
    const shown = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);
    labelsEl.innerHTML = shown.map(l => `<span>${l}</span>`).join('');
  }

  if (titleEl) titleEl.textContent = seed.label;
  if (valEl) valEl.textContent = `${seed.val} ${seed.unit}`;
  if (changeEl) {
    changeEl.textContent = seed.ch;
    changeEl.className = `chart-change ${seed.ch.startsWith('+') ? 'up' : 'down'}`;
  }
}

/** Render data tables and section cards */
function renderSectionData() {
  renderQuickOverview();
  renderGoldSection();
  renderFuelSection();
  renderStockSection();
  renderExchangeSection();
  renderInterestSection();
  // wire interactive behaviors after DOM nodes are rendered
  setupChartSwitching();
}

function renderGoldSection() {
  const summary = document.getElementById('goldSummaryCards');
  const tbody = document.querySelector('#goldTable tbody');
  const cardList = document.getElementById('goldCardList');

  if (summary) {
    summary.innerHTML = DATA.gold.slice(0, 3).map(g => {
      const diff = g.sell - g.buy;
      const unit = displayGoldUnit(g);
      return `
        <article class="summary-card">
          <span class="summary-card-kicker">${g.name}</span>
          <strong>${fmt(g.sell)} ${unit}</strong>
          <span class="summary-card-meta">Mua ${fmt(g.buy)} ${unit} · Chênh lệch ${fmt(diff)} đ</span>
        </article>
      `;
    }).join('');
  }

  if (tbody) {
    tbody.innerHTML = DATA.gold.map((g, i) => {
      const diff = g.sell - g.buy;
      return `<tr data-section="gold" data-index="${i}" class="clickable">
        <td>${g.name}</td>
        <td>${fmt(g.buy)}</td>
        <td>${fmt(g.sell)}</td>
        <td class="up">+${fmt(diff)}</td>
      </tr>`;
    }).join('');
  }

  drawSectionChart('gold', 'gold');

  if (cardList) {
    cardList.innerHTML = DATA.gold.map(g => `
      <div class="mc-row" style="flex-direction:column;gap:6px;padding:12px;">
        <div style="font-weight:700;font-size:14px;">${g.name}</div>
        <div style="display:flex;gap:16px;font-size:13px;font-family:var(--font-mono);">
          <span><span style="color:var(--text-muted);">Mua:</span> ${fmt(g.buy)}</span>
          <span><span style="color:var(--text-muted);">Bán:</span> ${fmt(g.sell)}</span>
          <span class="up">±${fmt(g.sell - g.buy)}</span>
        </div>
      </div>
    `).join('');
  }
}

function renderFuelSection() {
  const summary = document.getElementById('fuelSummaryCards');
  const tbody = document.querySelector('#fuelTable tbody');
  const cardList = document.getElementById('fuelCardList');

  if (summary) {
    summary.innerHTML = DATA.fuel.slice(0, 3).map(f => `
      <article class="summary-card">
        <span class="summary-card-kicker">${f.name}</span>
        <strong>${fmt(f.price)} ${displayFuelUnit(f)}</strong>
        <span class="summary-card-meta ${dirClass(f.change)}">${fmtChange(f.change, ' đ')} · ${f.date}</span>
      </article>
    `).join('');
  }

  if (tbody) {
    tbody.innerHTML = DATA.fuel.map((f, i) => `
      <tr data-section="fuel" data-index="${i}" class="clickable">
        <td>${f.name}</td>
        <td>${fmt(f.price)}</td>
        <td class="${dirClass(f.change)}">${fmtChange(f.change, ' đ')}</td>
        <td style="color:var(--text-muted);font-size:12px;">${f.date}</td>
      </tr>
    `).join('');
  }

  drawSectionChart('fuel', 'fuel');

  if (cardList) {
    cardList.innerHTML = DATA.fuel.map(f => `
      <div class="mc-row" style="padding:12px;">
        <span style="font-weight:600;">${f.name}</span>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
          <span style="font-family:var(--font-mono);font-weight:700;">${fmt(f.price)} ${displayFuelUnit(f)}</span>
          <span class="${dirClass(f.change)}" style="font-size:12px;">${fmtChange(f.change, ' đ')}</span>
        </div>
      </div>
    `).join('');
  }
}

function renderStockSection() {
  const summary = document.getElementById('stockSummaryCards');
  const data = DATA.stocks[currentStockTab];
  const tbody = document.querySelector('#stockTable tbody');
  const cardList = document.getElementById('stockCardList');

  if (summary) {
    summary.innerHTML = DATA.indices.map(i => `
      <article class="summary-card">
        <span class="summary-card-kicker">${i.name}</span>
        <strong>${fmt(i.value)}</strong>
        <span class="summary-card-meta ${dirClass(i.change)}">${fmtChange(i.change.toFixed(2), '')} (${fmtChange(i.pct.toFixed(2))}%)</span>
      </article>
    `).join('');
  }

  if (tbody && data) {
    tbody.innerHTML = data.map(s => `
      <tr>
        <td style="font-weight:700;">${s.code}</td>
        <td>${fmt(s.price)}</td>
        <td class="${dirClass(s.change)}">${fmtChange(s.change)}%</td>
        <td>${s.volume.toFixed(1)}</td>
      </tr>
    `).join('');
  }

  if (cardList && data) {
    cardList.innerHTML = data.map(s => `
      <div class="mc-row" style="padding:12px;">
        <span style="font-weight:700;">${s.code}</span>
        <div style="display:flex;gap:12px;font-size:13px;font-family:var(--font-mono);">
          <span>${fmt(s.price)}</span>
          <span class="${dirClass(s.change)}">${fmtChange(s.change)}%</span>
          <span style="color:var(--text-muted);">${s.volume.toFixed(1)}M</span>
        </div>
      </div>
    `).join('');
  }
}

function renderExchangeSection() {
  const summary = document.getElementById('exchangeSummaryCards');
  const tbody = document.querySelector('#forexTable tbody');
  const cardList = document.getElementById('forexCardList');

  if (summary) {
    summary.innerHTML = DATA.forex.slice(0, 4).map(f => `
      <article class="summary-card">
          <span class="summary-card-kicker">${f.currency}</span>
          <strong>${fmt(f.transfer)} đ</strong>
          <span class="summary-card-meta">Mua ${fmt(f.cash)} đ · Bán ${fmt(f.sell)} đ</span>
        </article>
    `).join('');
  }

  if (tbody) {
    tbody.innerHTML = DATA.forex.map(f => `
      <tr>
          <td>${f.currency}</td>
          <td>${fmt(f.cash)}</td>
          <td>${fmt(f.transfer)}</td>
          <td class="up">${fmt(f.sell)}</td>
        </tr>
    `).join('');
  }

  if (cardList) {
    cardList.innerHTML = DATA.forex.map(f => `
      <div class="mc-row" style="padding:12px;">
          <span style="font-weight:700;">${f.currency}</span>
          <div style="display:flex;gap:12px;font-size:13px;font-family:var(--font-mono);">
            <span><span style="color:var(--text-muted);">MUA:</span> ${fmt(f.transfer)}</span>
            <span class="up"><span style="color:var(--text-muted);">BÁN:</span> ${fmt(f.sell)}</span>
          </div>
        </div>
    `).join('');
  }
}

function renderInterestSection() {
  const summary = document.getElementById('interestSummaryCards');
  const grid = document.getElementById('ratesGrid');

  if (summary) {
    summary.innerHTML = DATA.rates.slice(0, 4).map(r => `
      <article class="summary-card">
        <span class="summary-card-kicker">${r.term}</span>
        <strong>${r.rate}%</strong>
        <span class="summary-card-meta">${r.bank}</span>
      </article>
    `).join('');
  }

  if (grid) {
    grid.innerHTML = DATA.rates.map(r => `
      <div class="rate-item">
        <span class="rate-label">${r.term}</span>
        <span class="rate-val">${r.rate}<small style="font-size:13px;font-weight:400;">%</small></span>
        <span class="rate-bank">${r.bank}</span>
      </div>
    `).join('');
  }
}

function renderForexTable() {
  const tbody = document.querySelector('#forexTable tbody');
  const cardList = document.getElementById('forexCardList');
  if (!tbody) return;

  tbody.innerHTML = DATA.forex.map(f => `
    <tr>
      <td>${f.flag} ${f.currency}</td>
      <td>${fmt(f.cash)}</td>
      <td>${fmt(f.transfer)}</td>
      <td class="up">${fmt(f.sell)}</td>
    </tr>
  `).join('');

  if (cardList) {
    cardList.innerHTML = DATA.forex.map(f => `
      <div class="mc-row" style="padding:12px;">
        <span style="font-weight:700;">${f.flag} ${f.currency}</span>
        <div style="display:flex;gap:12px;font-size:13px;font-family:var(--font-mono);">
          <span><span style="color:var(--text-muted);">MUA:</span> ${fmt(f.transfer)}</span>
          <span class="up"><span style="color:var(--text-muted);">BÁN:</span> ${fmt(f.sell)}</span>
        </div>
      </div>
    `).join('');
  }
}

function renderStockTable(tab) {
  currentStockTab = tab;
  renderStockSection();
}

function renderRates() {
  renderInterestSection();
}

function renderIndices() {
  renderStockSection();
}

// ====================================================
// CHART ENGINE
// ====================================================

/** Draw the main chart SVG */
function drawChart(type, period) {
  const seed = CHART_SEEDS[type];
  const pointCount = PERIODS[period];
  const labels = PERIOD_LABELS[period];
  const data = generatePath(seed, pointCount);
  const { line, area } = toSVGPath(data, 800, 200);

  const lineEl = document.getElementById('mainChartLine');
  const areaEl = document.getElementById('mainChartArea');
  if (lineEl) lineEl.setAttribute('d', line);
  if (areaEl) areaEl.setAttribute('d', area);

  // Update labels
  const labelsEl = document.getElementById('chartXLabels');
  if (labelsEl && labels) {
    const step = Math.max(1, Math.floor(labels.length / 6));
    const shown = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);
    labelsEl.innerHTML = shown.map(l => `<span>${l}</span>`).join('');
  }

  // Update chart info
  const titleEl  = document.getElementById('chartTitle');
  const valEl    = document.getElementById('chartCurrentVal');
  const changeEl = document.getElementById('chartChange');
  if (titleEl)  titleEl.textContent  = seed.label;
  if (valEl)    valEl.textContent    = `${seed.val} ${seed.unit}`;
  if (changeEl) {
    changeEl.textContent = seed.ch;
    changeEl.className = `chart-change ${seed.ch.startsWith('+') ? 'up' : 'down'}`;
  }
}

// ====================================================
// UPDATE TIME / REFRESH
// ====================================================

function updateTime() {
  const el = document.getElementById('lastUpdated');
  if (el) el.textContent = getTime();

  const pt = document.getElementById('previewTime');
  if (pt) pt.textContent = getTime();
}

function setFuelApiStatus(state, message, metaText = '') {
  const statusEl = document.getElementById('fuelApiStatus');
  const badgeEl = document.getElementById('fuelTableBadge');

  if (statusEl) {
    statusEl.classList.remove('is-loading', 'is-live', 'is-offline');
    statusEl.classList.add(state);
    statusEl.textContent = message;
  }

  if (badgeEl && metaText) {
    badgeEl.textContent = metaText;
  }
}

/** Fetch live gold prices from backend */
async function fetchGoldPricesFromAPI() {
  try {
    const res = await fetch(apiEndpoint('/gold-prices'));

    if (!res.ok) {
      console.warn('Unable to fetch gold prices from API:', res.status);
      return null;
    }

    const response = await res.json();
    if (!response || !Array.isArray(response.data)) return null;

    return response.data
      .filter(item => item.currency === 'VND')
      .map(item => ({
        name: item.name,
        buy: Number(item.buy || 0),
        sell: Number(item.sell || 0),
        changeBuy: Number(item.changeBuy || 0),
        changeSell: Number(item.changeSell || 0),
        unit: item.unit || 'VND/lượng',
        date: response.meta?.priceDate || getDate(),
      }))
      .filter(item => item.buy && item.sell);
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return null;
  }
}

/** Fetch live fuel prices from VietFuelAPI */
async function fetchFuelPricesFromAPI() {
  try {
    setFuelApiStatus('is-loading', 'API local: đang lấy dữ liệu…');
    const res = await fetch(apiEndpoint('/fuel-prices'));

    if (!res.ok) {
      console.warn('Unable to fetch fuel prices from API:', res.status);
      setFuelApiStatus('is-offline', 'API local: chưa phản hồi');
      return null;
    }

    const response = await res.json();

    if (!response || !response.data) {
      setFuelApiStatus('is-offline', 'API local: không có dữ liệu');
      return null;
    }

    // Transform API response to match existing mock data structure
    // API returns: { name, region1, region2, unit, sources: [...] }
    // We need: { name, price, change, date, icon }
    
    const transformed = response.data.map(item => {
      // Get primary price (region1, or first source region1)
      const primarySource = item.sources?.find(src => src.region1 || src.price) || {};
      let primaryPrice = item.region1 || item.price || primarySource.region1 || primarySource.price;

      return {
        name: item.name,
        price: primaryPrice || 0,
        change: Number(item.change ?? primarySource.change ?? 0),
        date: response.meta?.priceDateDisplay || getDate(),
        unit: item.unit || 'VND/lít',
        icon: item.name.includes('Xăng') ? '⛽' : '🛢️'
      };
    }).filter(item => item.price > 0);

    const priceDate = response.meta?.priceDateDisplay || getDate();
    setFuelApiStatus(
      'is-live',
      `API local: ${response.meta?.sourceCount || response.meta?.dataSources?.length || 0} nguồn`,
      `Cập nhật ${priceDate}`
    );

    return transformed;
  } catch (error) {
    console.error('Error fetching fuel prices:', error);
    setFuelApiStatus('is-offline', 'API local: lỗi kết nối');
    return null;
  }
}

/** Update data and re-render all sections */
async function refreshData() {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 700);
  }

  const [apiGoldData, apiFuelData] = await Promise.all([
    fetchGoldPricesFromAPI(),
    fetchFuelPricesFromAPI(),
  ]);

  if (apiGoldData && apiGoldData.length > 0) {
    DATA.gold = apiGoldData;
  } else {
    DATA.gold = DATA.gold.map(g => ({
      ...g,
      buy:  jitter(g.buy, 150),
      sell: jitter(g.sell, 150),
    }));
  }

  if (apiFuelData && apiFuelData.length > 0) {
    DATA.fuel = apiFuelData;
  } else {
    // Fallback: if API fails, jitter existing data
    DATA.fuel = DATA.fuel.map(f => ({
      ...f,
      price: jitter(f.price, 20),
    }));
  }

  // Jitter indices
  DATA.indices = DATA.indices.map(i => {
    const newVal = +(i.value + (Math.random() * 4 - 2)).toFixed(2);
    const delta  = +(newVal - i.value + i.change).toFixed(2);
    const pct    = +((delta / newVal) * 100).toFixed(2);
    return { ...i, value: newVal, change: delta, pct };
  });

  // Jitter forex
  DATA.forex = DATA.forex.map(f => ({
    ...f,
    cash:     jitter(f.cash, 10),
    transfer: jitter(f.transfer, 10),
    sell:     jitter(f.sell, 10),
  }));

  // Update ticker
  DATA.ticker[0].value = fmt(DATA.gold[0].sell);
  DATA.ticker[0].change = pctText(DATA.gold[0].changeSell || 0, DATA.gold[0].sell);
  DATA.ticker[0].dir = dirClass(DATA.gold[0].changeSell || 0);
  DATA.ticker[2].value = DATA.indices[0].value.toLocaleString('vi-VN');
  DATA.ticker[3].value = fmt(DATA.forex[0].transfer);
  DATA.ticker[1].value = fmt(DATA.fuel[0].price);
  DATA.ticker[1].change = fmtChange(DATA.fuel[0].change || 0, ' đ');
  DATA.ticker[1].dir = dirClass(DATA.fuel[0].change || 0);

  // Update preview metrics
  document.getElementById('pm-vnindex').textContent = DATA.indices[0].value.toLocaleString('vi-VN');
  document.getElementById('pm-gold').textContent    = fmt(DATA.gold[0].sell);
  document.getElementById('pm-fuel').textContent    = fmt(DATA.fuel[0].price);
  document.getElementById('pm-usd').textContent     = fmt(DATA.forex[0].transfer);
  const pmGoldCh = document.getElementById('pm-gold-ch');
  const pmFuelCh = document.getElementById('pm-fuel-ch');
  if (pmGoldCh) {
    pmGoldCh.textContent = DATA.ticker[0].change;
    pmGoldCh.className = `pm-change ${DATA.ticker[0].dir}`;
  }
  if (pmFuelCh) {
    pmFuelCh.textContent = DATA.ticker[1].change;
    pmFuelCh.className = `pm-change ${DATA.ticker[1].dir}`;
  }

  if (apiFuelData && apiFuelData.length > 0) {
    const apiDate = apiFuelData[0].date || getDate();
    setFuelApiStatus('is-live', `API local: ${apiFuelData.length} mặt hàng`, `Cập nhật ${apiDate}`);
  }

  updateTime();
  renderSectionData();
  setupChartSwitching();
  activateFirstMarketRows();
}

// ====================================================
// DETAIL MODAL
// ====================================================

function renderDetailModal(type) {
  if (type === 'gold') {
    return `
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Sản phẩm</th><th>Mua vào</th><th>Bán ra</th><th>Chênh lệch</th></tr></thead>
          <tbody>${DATA.gold.map(g => `<tr><td>${g.name}</td><td>${fmt(g.buy)} ${displayGoldUnit(g)}</td><td>${fmt(g.sell)} ${displayGoldUnit(g)}</td><td class="up">+${fmt(g.sell - g.buy)}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  if (type === 'fuel') {
    return `
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Loại</th><th>Giá</th><th>Thay đổi</th><th>Cập nhật</th></tr></thead>
          <tbody>${DATA.fuel.map(f => `<tr><td>${f.name}</td><td>${fmt(f.price)} ${displayFuelUnit(f)}</td><td class="${dirClass(f.change)}">${fmtChange(f.change, ' đ')}</td><td>${f.date}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  if (type === 'stock') {
    const rows = Object.entries(DATA.stocks).map(([tab, items]) => `
      <h4 class="detail-group-title">${tab === 'up' ? 'Tăng mạnh' : tab === 'down' ? 'Giảm mạnh' : 'Thanh khoản'}</h4>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Mã CK</th><th>Giá</th><th>Thay đổi</th><th>KL (triệu)</th></tr></thead>
          <tbody>${items.map(s => `<tr><td>${s.code}</td><td>${fmt(s.price)}</td><td class="${dirClass(s.change)}">${fmtChange(s.change)}%</td><td>${s.volume.toFixed(1)}</td></tr>`).join('')}</tbody>
        </table>
      </div>`).join('');
    return rows;
  }

  if (type === 'exchange') {
    return `
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Tiền tệ</th><th>Tiền mặt</th><th>Chuyển khoản</th><th>Bán ra</th></tr></thead>
          <tbody>${DATA.forex.map(f => `<tr><td>${f.currency}</td><td>${fmt(f.cash)}</td><td>${fmt(f.transfer)}</td><td>${fmt(f.sell)}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  if (type === 'interest') {
    return `
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Kỳ hạn</th><th>Lãi suất</th><th>Ngân hàng</th></tr></thead>
          <tbody>${DATA.rates.map(r => `<tr><td>${r.term}</td><td>${r.rate}%</td><td>${r.bank}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  return '';
}

function openDetailModal(type) {
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailModalBody');
  const title = document.getElementById('detailModalTitle');
  if (!modal || !content || !title) return;

  const titles = {
    gold: 'Chi tiết giá vàng',
    fuel: 'Chi tiết giá xăng dầu',
    stock: 'Chi tiết chứng khoán',
    exchange: 'Chi tiết tỷ giá',
    interest: 'Chi tiết lãi suất',
  };

  title.textContent = titles[type] || 'Chi tiết';
  content.innerHTML = renderDetailModal(type);
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  lockBodyScroll();
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  unlockBodyScroll();
}

function setupDetailButtons() {
  document.querySelectorAll('[data-detail-type]').forEach(btn => {
    btn.addEventListener('click', () => openDetailModal(btn.dataset.detailType));
  });

  const modal = document.getElementById('detailModal');
  const closeBtn = document.getElementById('detailModalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeDetailModal);
  if (modal) {
    modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeDetailModal));
  }
  // ensure Escape key closes and unlocks
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDetailModal();
  });
}

// ====================================================
// SMOOTH SCROLL / ACTIVE NAV
// ====================================================

function setNavActive(sectionId) {
  const targetHash = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
  document.querySelectorAll('.nav-link, .mobile-nav-link, .bn-item').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkHash = href.startsWith('#') ? href.substring(1) : href;
    link.classList.toggle('active', linkHash === targetHash);
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const header = document.getElementById('header');
      const offset = (header?.offsetHeight || 68) + 10;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });

      const mobileMenu = document.getElementById('mobileMenu');
      const hamburger = document.getElementById('hamburger');
      if (mobileMenu) mobileMenu.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
    });
  });
}

function setupActiveNavOnScroll() {
  const sections = ['home', 'gold', 'fuel', 'stock', 'exchange', 'interest'];
  const header = document.getElementById('header');

  const onScroll = () => {
    const offset = (header?.offsetHeight || 68) + 24;
    let active = 'home';

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= offset) active = id;
    });

    setNavActive(active);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ====================================================
// MOBILE MENU / REFRESH
// ====================================================

function setupMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });
}

function setupScrollEffect() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

function setupRefreshButton() {
  const btn = document.getElementById('refreshBtn');
  if (btn) btn.addEventListener('click', refreshData);
}

function setupTabs() {
  document.querySelectorAll('.mini-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mini-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderStockSection();
    });
  });
}

// ====================================================
// INIT APP
// ====================================================

function initApp() {
  updateTime();
  renderSectionData();
  setupTabs();
  setupDetailButtons();
  setupSmoothScroll();
  setupActiveNavOnScroll();
  setupMobileMenu();
  setupScrollEffect();
  setupRefreshButton();
  refreshData();

  // initial chart selection: mark first items active
  setTimeout(activateFirstMarketRows, 300);

  setInterval(updateTime, 1000);
  // Refresh data every 5 minutes (300000 ms)
  setInterval(refreshData, 300000);

  console.log('FinFlow.vn — Khởi động thành công ✅');
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
