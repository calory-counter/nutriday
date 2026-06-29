/*!
 * NutriDay — счетчик калорий и БЖУ / calorie & macro tracker
 * Copyright (c) 2026 NutriDay. All rights reserved. · Все права защищены.
 *
 * Proprietary software. NOT open source, NOT public domain.
 * Unauthorized copying, modification, distribution, or commercial use of this
 * code — in whole or in part — is prohibited without prior written permission.
 * The fact that this code is viewable in the browser grants no license to reuse it.
 * See the LICENSE file for full terms. Contact: nutriday@yandex.ru
 */

const STORAGE_KEYS = {
  customProducts: 'nutriday.custom-products.v1',
  dailyJournal: 'nutriday.daily-journal.v1',
  uiState: 'nutriday.ui-state.v1',
  customProductDraft: 'nutriday.custom-product-draft.v1',
};

const COMMON_FOODS = [
  { id: 'ref-buckwheat', name: 'Гречка сухая', brand: 'Справочник', calories: 343, protein: 13, fat: 3.4, carbs: 71.5, fiber: 10, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-oatmeal', name: 'Овсянка сухая', brand: 'Справочник', calories: 366, protein: 12.3, fat: 6.1, carbs: 59.5, fiber: 8, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-rice', name: 'Рис белый сухой', brand: 'Справочник', calories: 344, protein: 6.7, fat: 0.7, carbs: 78.9, fiber: 1.1, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-pasta', name: 'Макароны сухие', brand: 'Справочник', calories: 344, protein: 10.4, fat: 1.1, carbs: 71.5, fiber: 3.5, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-chicken', name: 'Куриная грудка', brand: 'Справочник', calories: 113, protein: 23.6, fat: 1.9, carbs: 0, fiber: 0, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-beef', name: 'Говядина постная', brand: 'Справочник', calories: 158, protein: 20.2, fat: 7, carbs: 0, fiber: 0, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-salmon', name: 'Лосось', brand: 'Справочник', calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-egg', name: 'Яйцо куриное', brand: 'Справочник', calories: 157, protein: 12.7, fat: 11.5, carbs: 0.7, fiber: 0, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-cottage', name: 'Творог 5%', brand: 'Справочник', calories: 121, protein: 17.2, fat: 5, carbs: 1.8, fiber: 0, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-milk', name: 'Молоко 2.5%', brand: 'Справочник', calories: 52, protein: 2.8, fat: 2.5, carbs: 4.7, fiber: 0, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-kefir', name: 'Кефир 2.5%', brand: 'Справочник', calories: 53, protein: 2.9, fat: 2.5, carbs: 4, fiber: 0, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-banana', name: 'Банан', brand: 'Справочник', calories: 89, protein: 1.5, fat: 0.2, carbs: 21, fiber: 2.6, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-apple', name: 'Яблоко', brand: 'Справочник', calories: 47, protein: 0.4, fat: 0.4, carbs: 9.8, fiber: 1.8, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-potato', name: 'Картофель', brand: 'Справочник', calories: 77, protein: 2, fat: 0.4, carbs: 16.3, fiber: 1.4, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
  { id: 'ref-bread', name: 'Хлеб ржаной', brand: 'Справочник', calories: 259, protein: 8.5, fat: 3.3, carbs: 48.3, fiber: 5.8, quantityLabel: '100 г', imageUrl: '', source: 'Справочник', sourceType: 'reference' },
];

// Centralized application state keeps UI rendering predictable in plain JS.
const state = {
  selectedProduct: null,
  searchResults: [],
  customProducts: loadFromStorage(STORAGE_KEYS.customProducts, []),
  dailyJournal: loadFromStorage(STORAGE_KEYS.dailyJournal, {}),
  uiState: loadFromStorage(STORAGE_KEYS.uiState, {
    searchQuery: '',
    grams: 100,
  }),
  customProductDraft: loadFromStorage(STORAGE_KEYS.customProductDraft, {}),
};

const els = {
  currentDateLabel: document.getElementById('currentDateLabel'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  searchStatus: document.getElementById('searchStatus'),
  searchResults: document.getElementById('searchResults'),
  resultCardTemplate: document.getElementById('resultCardTemplate'),
  selectedProductCard: document.getElementById('selectedProductCard'),
  selectedProductName: document.getElementById('selectedProductName'),
  selectedProductMeta: document.getElementById('selectedProductMeta'),
  selectedSourceBadge: document.getElementById('selectedSourceBadge'),
  selectedProductFacts: document.getElementById('selectedProductFacts'),
  portionForm: document.getElementById('portionForm'),
  gramsInput: document.getElementById('gramsInput'),
  portionSummary: document.getElementById('portionSummary'),
  totalsGrid: document.getElementById('totalsGrid'),
  macroBars: document.getElementById('macroBars'),
  macroBreakdownLabel: document.getElementById('macroBreakdownLabel'),
  diaryList: document.getElementById('diaryList'),
  diaryItemTemplate: document.getElementById('diaryItemTemplate'),
  entriesCount: document.getElementById('entriesCount'),
  clearDayButton: document.getElementById('clearDayButton'),
  customProductModal: document.getElementById('customProductModal'),
  openCustomProductModal: document.getElementById('openCustomProductModal'),
  closeModalButton: document.getElementById('closeModalButton'),
  cancelModalButton: document.getElementById('cancelModalButton'),
  customProductForm: document.getElementById('customProductForm'),
};

document.addEventListener('DOMContentLoaded', () => {
  ensureTodayBucket();
  renderCurrentDate();
  restoreDrafts();
  renderDiary();
  renderTotals();
  bindEvents();
});

function bindEvents() {
  els.searchForm.addEventListener('submit', handleSearchSubmit);
  els.portionForm.addEventListener('submit', handleAddToDiary);
  els.clearDayButton.addEventListener('click', clearCurrentDay);
  els.searchInput.addEventListener('input', handleSearchInputDraft);
  els.gramsInput.addEventListener('input', handleGramsDraft);

  els.openCustomProductModal.addEventListener('click', openModal);
  els.closeModalButton.addEventListener('click', closeModal);
  els.cancelModalButton.addEventListener('click', closeModal);
  els.customProductModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'true') {
      closeModal();
    }
  });

  els.customProductForm.addEventListener('submit', handleCreateCustomProduct);
  els.customProductForm.addEventListener('input', handleCustomProductDraft);
}

function renderCurrentDate() {
  els.currentDateLabel.textContent = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function restoreDrafts() {
  els.searchInput.value = state.uiState.searchQuery || '';
  els.gramsInput.value = String(state.uiState.grams || 100);

  Object.entries(state.customProductDraft).forEach(([key, value]) => {
    const field = els.customProductForm.elements.namedItem(key);
    if (field && 'value' in field) {
      field.value = value;
    }
  });
}

function handleSearchInputDraft(event) {
  state.uiState.searchQuery = event.target.value;
  saveToStorage(STORAGE_KEYS.uiState, state.uiState);
}

function handleGramsDraft(event) {
  state.uiState.grams = Number(event.target.value) || 100;
  saveToStorage(STORAGE_KEYS.uiState, state.uiState);

  if (state.selectedProduct && Number(event.target.value) > 0) {
    renderPortionPreview(state.selectedProduct, Number(event.target.value));
  }
}

function handleCustomProductDraft() {
  const formData = new FormData(els.customProductForm);
  state.customProductDraft = Object.fromEntries(formData.entries());
  saveToStorage(STORAGE_KEYS.customProductDraft, state.customProductDraft);
}

async function handleSearchSubmit(event) {
  event.preventDefault();

  const query = els.searchInput.value.trim();
  if (!query) {
    setSearchStatus('Введите название продукта, чтобы начать поиск.');
    return;
  }

  setSearchStatus(`Ищу «${query}»...`);
  renderSearchResults([]);

  const [customResults, referenceResults, apiResult] = await Promise.allSettled([
    Promise.resolve(searchCustomProducts(query)),
    Promise.resolve(searchReferenceFoods(query)),
    searchOpenFoodFacts(query),
  ]);

  const custom = customResults.status === 'fulfilled' ? customResults.value : [];
  const reference = referenceResults.status === 'fulfilled' ? referenceResults.value : [];
  const api = apiResult.status === 'fulfilled' ? apiResult.value : [];

  if (apiResult.status === 'rejected') {
    console.warn('Open Food Facts unavailable, using local fallback only.', apiResult.reason);
  }

  const combinedResults = mergeResults(custom, reference, api);
  state.searchResults = combinedResults;

  if (!combinedResults.length) {
    setSearchStatus(
      'Ничего не найдено. Попробуйте более точный запрос или добавьте свой продукт вручную.',
    );
    return;
  }

  if (apiResult.status === 'rejected') {
    setSearchStatus(
      `Найдено ${combinedResults.length} вариантов. Внешняя база временно недоступна, показаны локальные результаты.`,
    );
  } else {
    setSearchStatus(`Найдено ${combinedResults.length} вариантов.`);
  }

  renderSearchResults(combinedResults);
}

function searchReferenceFoods(query) {
  const normalizedQuery = query.toLowerCase();

  return COMMON_FOODS.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
}

function searchCustomProducts(query) {
  const normalizedQuery = query.toLowerCase();

  return state.customProducts
    .filter((item) => {
      const haystack = `${item.name} ${item.brand || ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .map((item) => ({
      ...item,
      source: 'Мой продукт',
      sourceType: 'custom',
    }));
}

async function searchOpenFoodFacts(query) {
  // Full-text search via Open Food Facts "Search-a-licious" service.
  // The legacy cgi/search.pl endpoint is deprecated and does NOT send the
  // Access-Control-Allow-Origin header, so the browser blocks it on https
  // origins (e.g. GitHub Pages). This endpoint is CORS-enabled.
  const url = new URL('https://search.openfoodfacts.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('page_size', '12');
  url.searchParams.set('langs', 'ru');
  url.searchParams.set(
    'fields',
    [
      'code',
      'product_name',
      'brands',
      'quantity',
      'image_front_small_url',
      'nutriments',
    ].join(','),
  );

  // Guard against a hanging request so the local fallback always renders.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Open Food Facts error: ${response.status}`);
    }

    const data = await response.json();
    const products = Array.isArray(data.hits) ? data.hits : [];

    return products
      .map(normalizeOpenFoodFactsProduct)
      .filter((item) => item.name && hasAtLeastOneNutrient(item));
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeOpenFoodFactsProduct(product) {
  const nutriments = product.nutriments || {};

  return {
    id: product.code || crypto.randomUUID(),
    name: product.product_name?.trim() || 'Без названия',
    brand: product.brands?.trim() || '',
    quantityLabel: product.quantity?.trim() || '',
    calories: pickNumber(nutriments['energy-kcal_100g'], nutriments['energy-kcal'], nutriments.energy_value),
    protein: pickNumber(nutriments.proteins_100g, nutriments.proteins),
    fat: pickNumber(nutriments.fat_100g, nutriments.fat),
    carbs: pickNumber(nutriments.carbohydrates_100g, nutriments.carbohydrates),
    fiber: pickNumber(nutriments.fiber_100g, nutriments.fiber, 0),
    imageUrl: product.image_front_small_url || '',
    source: 'Open Food Facts',
    sourceType: 'api',
  };
}

function mergeResults(...resultGroups) {
  const seen = new Set();

  return resultGroups.flat().filter((item) => {
    const key = `${item.name.toLowerCase()}|${(item.brand || '').toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function renderSearchResults(results) {
  els.searchResults.innerHTML = '';

  results.forEach((item) => {
    const fragment = els.resultCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.result-card');
    const title = fragment.querySelector('.result-title');
    const meta = fragment.querySelector('.result-meta');
    const source = fragment.querySelector('.result-source');
    const facts = fragment.querySelector('.result-facts');
    const action = fragment.querySelector('.result-action');

    title.textContent = item.name;
    meta.textContent = buildProductMeta(item);
    source.textContent = item.source;
    facts.append(...buildNutrientNodes(item));
    action.addEventListener('click', () => selectProduct(item));

    if (item.imageUrl) {
      card.style.backgroundImage = `linear-gradient(rgba(255,252,245,0.96), rgba(255,252,245,0.96)), url(${item.imageUrl})`;
      card.style.backgroundRepeat = 'no-repeat';
      card.style.backgroundPosition = 'right bottom';
      card.style.backgroundSize = '92px';
    }

    els.searchResults.appendChild(fragment);
  });
}

function selectProduct(item) {
  state.selectedProduct = item;
  els.selectedProductCard.classList.remove('hidden');
  els.selectedProductName.textContent = item.name;
  els.selectedProductMeta.textContent = buildProductMeta(item);
  els.selectedSourceBadge.textContent = item.source;
  els.selectedProductFacts.innerHTML = '';
  els.selectedProductFacts.append(...buildNutrientNodes(item));
  els.gramsInput.value = '100';
  renderPortionPreview(item, 100);
}

function handleAddToDiary(event) {
  event.preventDefault();

  if (!state.selectedProduct) {
    return;
  }

  const grams = Number(els.gramsInput.value);
  if (!grams || grams <= 0) {
    renderPortionMessage('Введите корректное количество в граммах.');
    return;
  }

  state.uiState.grams = grams;
  saveToStorage(STORAGE_KEYS.uiState, state.uiState);

  // All diary values are persisted per day, so the page is ready to use after reload.
  const portion = calculatePortion(state.selectedProduct, grams);
  const entry = {
    id: crypto.randomUUID(),
    date: getTodayKey(),
    productId: state.selectedProduct.id,
    name: state.selectedProduct.name,
    brand: state.selectedProduct.brand,
    source: state.selectedProduct.source,
    grams,
    ...portion,
  };

  const todayKey = getTodayKey();
  const todayEntries = getCurrentDayEntries();
  state.dailyJournal[todayKey] = [entry, ...todayEntries];
  saveToStorage(STORAGE_KEYS.dailyJournal, state.dailyJournal);

  renderPortionPreview(state.selectedProduct, grams, true);
  renderDiary();
  renderTotals();
}

function renderPortionPreview(item, grams, asSuccess = false) {
  const portion = calculatePortion(item, grams);
  els.portionSummary.classList.remove('hidden');
  els.portionSummary.textContent = `${
    asSuccess ? 'Добавлено в дневник.' : 'Для порции:'
  } ${grams} г = ${formatNumber(portion.calories)} ккал, Б ${formatNumber(portion.protein)} г, Ж ${formatNumber(
    portion.fat,
  )} г, У ${formatNumber(portion.carbs)} г, клетчатка ${formatNumber(portion.fiber)} г.`;
}

function renderPortionMessage(message) {
  els.portionSummary.classList.remove('hidden');
  els.portionSummary.textContent = message;
}

function renderDiary() {
  const entries = getCurrentDayEntries();
  els.diaryList.innerHTML = '';
  els.entriesCount.textContent = `${entries.length} ${pluralize(entries.length, ['позиция', 'позиции', 'позиций'])}`;

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'status-line';
    empty.textContent = 'Дневник пока пуст. Найдите продукт и добавьте первую порцию.';
    els.diaryList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const fragment = els.diaryItemTemplate.content.cloneNode(true);
    const title = fragment.querySelector('.diary-item-title');
    const grams = fragment.querySelector('.diary-item-grams');
    const meta = fragment.querySelector('.diary-item-meta');
    const facts = fragment.querySelector('.diary-item-facts');
    const removeButton = fragment.querySelector('.diary-item-delete');

    title.textContent = entry.name;
    grams.textContent = `${entry.grams} г`;
    meta.textContent = [entry.brand, entry.source].filter(Boolean).join(' · ');
    facts.textContent = `${formatNumber(entry.calories)} ккал · Б ${formatNumber(entry.protein)} г · Ж ${formatNumber(
      entry.fat,
    )} г · У ${formatNumber(entry.carbs)} г · Клетчатка ${formatNumber(entry.fiber)} г`;
    removeButton.addEventListener('click', () => removeDiaryEntry(entry.id));

    els.diaryList.appendChild(fragment);
  });
}

function removeDiaryEntry(entryId) {
  const todayKey = getTodayKey();
  state.dailyJournal[todayKey] = getCurrentDayEntries().filter((entry) => entry.id !== entryId);
  saveToStorage(STORAGE_KEYS.dailyJournal, state.dailyJournal);
  renderDiary();
  renderTotals();
}

function renderTotals() {
  const totals = calculateTotals(getCurrentDayEntries());
  const items = [
    ['Калории', `${formatNumber(totals.calories)} ккал`],
    ['Белки', `${formatNumber(totals.protein)} г`],
    ['Жиры', `${formatNumber(totals.fat)} г`],
    ['Углеводы', `${formatNumber(totals.carbs)} г`],
    ['Клетчатка', `${formatNumber(totals.fiber)} г`],
  ];

  els.totalsGrid.innerHTML = '';
  items.forEach(([label, value]) => {
    const card = document.createElement('div');
    card.className = 'total-card';
    card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    els.totalsGrid.appendChild(card);
  });

  renderMacroBreakdown(totals);
}

function renderMacroBreakdown(totals) {
  const caloriesFromProtein = totals.protein * 4;
  const caloriesFromFat = totals.fat * 9;
  const caloriesFromCarbs = totals.carbs * 4;
  const totalMacroCalories = caloriesFromProtein + caloriesFromFat + caloriesFromCarbs;

  const ratios = [
    { label: 'Белки', value: caloriesFromProtein, className: 'protein-fill' },
    { label: 'Жиры', value: caloriesFromFat, className: 'fat-fill' },
    { label: 'Углеводы', value: caloriesFromCarbs, className: 'carbs-fill' },
  ].map((item) => ({
    ...item,
    percent: totalMacroCalories ? (item.value / totalMacroCalories) * 100 : 0,
  }));

  els.macroBars.innerHTML = '';
  ratios.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'macro-bar';
    row.innerHTML = `
      <strong>${item.label}</strong>
      <div class="macro-bar-track">
        <div class="macro-bar-fill ${item.className}" style="width: ${item.percent.toFixed(1)}%"></div>
      </div>
      <span>${item.percent.toFixed(0)}%</span>
    `;
    els.macroBars.appendChild(row);
  });

  els.macroBreakdownLabel.textContent = totalMacroCalories
    ? `${formatNumber(totalMacroCalories)} ккал из БЖУ`
    : 'Нет данных для расчета';
}

function handleCreateCustomProduct(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const product = {
    id: crypto.randomUUID(),
    name: String(formData.get('name') || '').trim(),
    brand: String(formData.get('brand') || '').trim(),
    calories: Number(formData.get('calories') || 0),
    protein: Number(formData.get('protein') || 0),
    fat: Number(formData.get('fat') || 0),
    carbs: Number(formData.get('carbs') || 0),
    fiber: Number(formData.get('fiber') || 0),
    quantityLabel: '100 г',
    source: 'Мой продукт',
    sourceType: 'custom',
    imageUrl: '',
  };

  state.customProducts = [product, ...state.customProducts];
  saveToStorage(STORAGE_KEYS.customProducts, state.customProducts);
  state.customProductDraft = {};
  saveToStorage(STORAGE_KEYS.customProductDraft, state.customProductDraft);

  event.currentTarget.reset();
  closeModal();
  setSearchStatus(`Продукт «${product.name}» сохранен локально.`);

  if (els.searchInput.value.trim()) {
    handleSearchSubmit(new Event('submit'));
  }
}

function clearCurrentDay() {
  const todayKey = getTodayKey();

  if (!getCurrentDayEntries().length) {
    return;
  }

  state.dailyJournal[todayKey] = [];
  saveToStorage(STORAGE_KEYS.dailyJournal, state.dailyJournal);
  renderDiary();
  renderTotals();
}

function ensureTodayBucket() {
  const todayKey = getTodayKey();
  if (!Array.isArray(state.dailyJournal[todayKey])) {
    state.dailyJournal[todayKey] = [];
    saveToStorage(STORAGE_KEYS.dailyJournal, state.dailyJournal);
  }
}

function openModal() {
  els.customProductModal.classList.remove('hidden');
  els.customProductModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  els.customProductModal.classList.add('hidden');
  els.customProductModal.setAttribute('aria-hidden', 'true');
}

function getCurrentDayEntries() {
  return state.dailyJournal[getTodayKey()] || [];
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculatePortion(product, grams) {
  const factor = grams / 100;

  return {
    calories: round(product.calories * factor),
    protein: round(product.protein * factor),
    fat: round(product.fat * factor),
    carbs: round(product.carbs * factor),
    fiber: round((product.fiber || 0) * factor),
  };
}

function calculateTotals(entries) {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      fat: acc.fat + entry.fat,
      carbs: acc.carbs + entry.carbs,
      fiber: acc.fiber + entry.fiber,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
  );
}

function buildProductMeta(item) {
  const parts = [item.brand, item.quantityLabel].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Данные на 100 г';
}

function buildNutrientNodes(item) {
  const nutrients = [
    ['Ккал', `${formatNumber(item.calories)}`],
    ['Белки', `${formatNumber(item.protein)} г`],
    ['Жиры', `${formatNumber(item.fat)} г`],
    ['Углеводы', `${formatNumber(item.carbs)} г`],
    ['Клетчатка', `${formatNumber(item.fiber || 0)} г`],
  ];

  return nutrients.map(([label, value]) => {
    const chip = document.createElement('div');
    chip.className = 'nutrient-chip';
    chip.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    return chip;
  });
}

function hasAtLeastOneNutrient(item) {
  return [item.calories, item.protein, item.fat, item.carbs, item.fiber].some(
    (value) => Number.isFinite(value) && value > 0,
  );
}

function pickNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) {
      return number;
    }
  }

  return 0;
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    // Fallback keeps the app usable even if storage was corrupted manually.
    console.error(`Storage read error for ${key}`, error);
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setSearchStatus(message) {
  els.searchStatus.textContent = message;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function pluralize(number, forms) {
  const mod10 = number % 10;
  const mod100 = number % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return forms[1];
  }

  return forms[2];
}
