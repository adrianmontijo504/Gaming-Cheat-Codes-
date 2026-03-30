const state = {
  search: '',
  category: 'all',
  dlc: 'all',
  testingOnly: false,
  officialOnly: false
};

const els = {
  totalCount: document.getElementById('totalCount'),
  resultSummary: document.getElementById('resultSummary'),
  results: document.getElementById('results'),
  activeFilters: document.getElementById('activeFilters'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  dlcFilter: document.getElementById('dlcFilter'),
  testingOnly: document.getElementById('testingOnly'),
  officialOnly: document.getElementById('officialOnly'),
  clearBtn: document.getElementById('clearBtn'),
  cardTemplate: document.getElementById('cardTemplate')
};

function uniqueValues(items, key) {
  return [...new Set(items.map(item => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function populateSelect(select, values) {
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function formatVerification(value) {
  return value === 'official' ? 'Official setup' : 'Community-curated';
}

function matchesSearch(item, search) {
  if (!search) return true;
  const haystack = [
    item.name,
    item.code,
    item.effect,
    item.category,
    item.dlc,
    item.notes,
    item.verification
  ].join(' ').toLowerCase();
  return haystack.includes(search);
}

function filteredData() {
  const search = state.search.trim().toLowerCase();

  return CHEAT_DATA.filter(item => {
    if (!matchesSearch(item, search)) return false;
    if (state.category !== 'all' && item.category !== state.category) return false;
    if (state.dlc !== 'all' && item.dlc !== state.dlc) return false;
    if (state.testingOnly && !item.needsTestingCheats) return false;
    if (state.officialOnly && item.verification !== 'official') return false;
    return true;
  });
}

function renderActiveFilters() {
  const chips = [];
  if (state.search) chips.push(`Search: ${state.search}`);
  if (state.category !== 'all') chips.push(`Category: ${state.category}`);
  if (state.dlc !== 'all') chips.push(`Pack: ${state.dlc}`);
  if (state.testingOnly) chips.push('Needs testingcheats');
  if (state.officialOnly) chips.push('Official only');

  els.activeFilters.innerHTML = '';
  chips.forEach(text => {
    const chip = document.createElement('span');
    chip.className = 'active-filter-chip';
    chip.textContent = text;
    els.activeFilters.appendChild(chip);
  });
}

function createCard(item) {
  const node = els.cardTemplate.content.firstElementChild.cloneNode(true);

  node.querySelector('.tag--category').textContent = item.category;
  node.querySelector('.tag--dlc').textContent = item.dlc;
  node.querySelector('.tag--verify').textContent = formatVerification(item.verification);
  node.querySelector('.card__title').textContent = item.name;
  node.querySelector('.code-block').textContent = item.code;
  node.querySelector('.effect').textContent = item.effect;
  node.querySelector('.notes').textContent = item.notes || '';
  if (item.needsTestingCheats) {
    node.querySelector('.tag--testing').classList.remove('hidden');
  }

  const copyBtn = node.querySelector('.copy-btn');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(item.code);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 1000);
    } catch {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => {
        copyBtn.textContent = 'Copy code';
      }, 1200);
    }
  });

  return node;
}

function renderResults() {
  const items = filteredData();
  els.results.innerHTML = '';
  els.totalCount.textContent = String(CHEAT_DATA.length);
  els.resultSummary.textContent = `${items.length} result${items.length === 1 ? '' : 's'} shown`;

  renderActiveFilters();

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<strong>No cheats matched.</strong><br>Try a broader search, another category, or clear the filters.';
    els.results.appendChild(empty);
    return;
  }

  items.forEach(item => {
    els.results.appendChild(createCard(item));
  });
}

function clearFilters() {
  state.search = '';
  state.category = 'all';
  state.dlc = 'all';
  state.testingOnly = false;
  state.officialOnly = false;

  els.searchInput.value = '';
  els.categoryFilter.value = 'all';
  els.dlcFilter.value = 'all';
  els.testingOnly.checked = false;
  els.officialOnly.checked = false;

  renderResults();
}

function init() {
  populateSelect(els.categoryFilter, uniqueValues(CHEAT_DATA, 'category'));
  populateSelect(els.dlcFilter, uniqueValues(CHEAT_DATA, 'dlc'));

  els.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderResults();
  });

  els.categoryFilter.addEventListener('change', (event) => {
    state.category = event.target.value;
    renderResults();
  });

  els.dlcFilter.addEventListener('change', (event) => {
    state.dlc = event.target.value;
    renderResults();
  });

  els.testingOnly.addEventListener('change', (event) => {
    state.testingOnly = event.target.checked;
    renderResults();
  });

  els.officialOnly.addEventListener('change', (event) => {
    state.officialOnly = event.target.checked;
    renderResults();
  });

  els.clearBtn.addEventListener('click', clearFilters);

  renderResults();
}

init();
