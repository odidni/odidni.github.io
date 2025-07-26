let allData = [];
let currentPage = 1;
const pageSize = 5;
let currentSort = { key: "date", order: "desc" };

function getSelectedCategories() {
  return Array.from(document.querySelectorAll('#category-checkboxes input[type=checkbox]:checked')).map(cb => cb.value);
}

function compareDates(a, b) {
  const dateA = new Date(a.date || a["게시일"] || a["Date"]);
  const dateB = new Date(b.date || b["게시일"] || b["Date"]);
  return currentSort.order === 'asc' ? dateA - dateB : dateB - dateA;
}

function paginate(data, page) {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

function renderTable(data) {
  const tbody = document.getElementById('post-list');
  tbody.innerHTML = '';
  data.forEach((post, index) => {
    const isKR = post['국가'] === '대한민국';
    const titleKey = isKR ? '제목' : 'Title';
    const descKey = isKR ? '내용' : 'Description';
    const rolesKey = isKR ? '모집 분야' : 'Roles';
    const durationKey = isKR ? '예상 기간' : 'Duration';
    const linkKey = isKR ? '참고 정보' : 'Link';
    const dateKey = isKR ? '게시일' : 'Date';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${post[dateKey] || ''}</td>
      <td><a href="#" data-index="${index}">${post[titleKey]}</a></td>
      <td>${post[rolesKey]}</td>
      <td>${post[durationKey]}</td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('#post-list a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const idx = parseInt(a.dataset.index);
      showModal(allData[idx]);
    });
  });
}

function renderPagination(total) {
  const totalPages = Math.ceil(total / pageSize);
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      filterAndRender();
    });
    container.appendChild(btn);
  }
}

function filterAndRender() {
  const keyword = document.getElementById('search-input').value.toLowerCase();
  const selectedCats = getSelectedCategories();
  const type = document.getElementById('type-filter').value;
  const country = document.getElementById('country-filter').value;

  const filtered = allData.filter(post => {
    const isKR = post['국가'] === '대한민국';
    const titleKey = isKR ? '제목' : 'Title';
    const descKey = isKR ? '내용' : 'Description';
    const rolesKey = isKR ? '모집 분야' : 'Roles';
    const typeKey = isKR ? '구분' : 'Type';
    const countryKey = isKR ? '국가' : 'Country';

    const matchesKeyword = !keyword ||
      (post[titleKey]?.toLowerCase().includes(keyword)) ||
      (post[descKey]?.toLowerCase().includes(keyword)) ||
      (post[rolesKey]?.toLowerCase().includes(keyword));
    const matchesCategory = selectedCats.length === 0 || selectedCats.some(cat => post[rolesKey]?.includes(cat));
    const matchesType = !type || post[typeKey]?.toLowerCase().includes(type);
    const matchesCountry = !country || post[countryKey]?.includes(country);

    return matchesKeyword && matchesCategory && matchesType && matchesCountry;
  });

  filtered.sort(compareDates);
  renderTable(paginate(filtered, currentPage));
  renderPagination(filtered.length);
}

function loadPosts() {
  const country = document.getElementById('country-filter').value;
  const url = `https://script.google.com/macros/s/AKfycbwHoe5QiK6ee56qLgMB1G7gfRR36QwQXpXDJj2urIvZb0lM7oykUWe-q5vbMV9kKhmA/exec?country=${country}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      allData = data;
      currentPage = 1;
      filterAndRender();
    });
}

function showModal(post) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  const isKR = post['국가'] === '대한민국';
  const keys = isKR ? {
    title: '제목', desc: '내용', roles: '모집 분야', duration: '예상 기간', link: '참고 정보'
  } : {
    title: 'Title', desc: 'Description', roles: 'Roles', duration: 'Duration', link: 'Link'
  };
  const text = post[keys.desc] || '';
  const linked = text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>');
  body.innerHTML = `
    <h2>${post[keys.title]}</h2>
    <p>${linked}</p>
    <p><strong>Roles:</strong> ${post[keys.roles]}</p>
    <p><strong>Duration:</strong> ${post[keys.duration]}</p>
    ${post[keys.link] ? `<p><a href="${post[keys.link]}" target="_blank">More Info</a></p>` : ''}
  `;
  modal.classList.remove('hidden');
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
});

document.getElementById('country-filter').addEventListener('change', loadPosts);
document.getElementById('type-filter').addEventListener('change', filterAndRender);
document.querySelectorAll('#category-checkboxes input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', filterAndRender);
});
document.getElementById('search-input').addEventListener('input', filterAndRender);
document.querySelector('[data-sort="date"]').addEventListener('click', () => {
  currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
  filterAndRender();
});

window.addEventListener('DOMContentLoaded', () => {
  const lang = navigator.language || navigator.userLanguage;
  const countryMap = {
    'ko': '대한민국', 'ja': '日本', 'zh': '中国', 'th': 'ไทย', 'vi': 'Việt Nam',
    'id': 'Indonesia', 'en': 'United States', 'fr': 'Français', 'es': 'España',
    'de': 'Deutschland', 'ru': 'Россия', 'pt': 'Brasil', 'tr': 'Türkiye'
  };
  const langCode = lang.slice(0, 2);
  const defaultCountry = countryMap[langCode];
  const select = document.getElementById('country-filter');
  if (defaultCountry) {
    for (let opt of select.options) {
      if (opt.value === defaultCountry) {
        opt.selected = true;
        break;
      }
    }
  }
  loadPosts();
});
