    const pageSize = 5;
    let currentPage = 1;
    let allData = [];

    function paginate(data, page) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return data.slice(start, end);
    }

    function renderPagination(total) {
      const totalPages = Math.ceil(total / pageSize);
      const pagination = document.getElementById('pagination');
      pagination.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
          currentPage = i;
          renderPosts();
        });
        pagination.appendChild(btn);
      }
    }

    function getSelectedCategories() {
      return Array.from(document.querySelectorAll('#category-checkboxes input[type=checkbox]:checked')).map(cb => cb.value);
    }

    function renderPosts() {
      const ul = document.getElementById('post-list');
      ul.innerHTML = '<li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li>';
      setTimeout(() => {
        const keyword = document.getElementById('search-input').value.toLowerCase();
        const selectedCats = getSelectedCategories();
        const type = document.getElementById('type-filter').value;
        const country = document.getElementById('country-filter').value;

        const filtered = allData.filter(post => {
          const isKR = country === '대한민국';
          const titleKey = isKR ? '제목' : 'Title';
          const descKey = isKR ? '내용' : 'Description';
          const rolesKey = isKR ? '모집 분야' : 'Roles';
          const typeKey = isKR ? '구분' : 'Type';
          const countryKey = isKR ? '국가' : 'Country';

          const matchesKeyword = !keyword ||
            (post[titleKey] && post[titleKey].toLowerCase().includes(keyword)) ||
            (post[descKey] && post[descKey].toLowerCase().includes(keyword)) ||
            (post[rolesKey] && post[rolesKey].toLowerCase().includes(keyword));

          const matchesCategory = selectedCats.length === 0 || selectedCats.some(cat => post[rolesKey]?.includes(cat));
          const matchesType = !type || (post[typeKey] && post[typeKey].toLowerCase().includes(type));
          const matchesCountry = !country || (post[countryKey] && post[countryKey].includes(country));

          return matchesKeyword && matchesCategory && matchesType && matchesCountry;
        });

        const paged = paginate(filtered, currentPage);
        ul.innerHTML = '';
        paged.forEach(post => {
          const isKR = post['국가'] === '대한민국';
          const titleKey = isKR ? '제목' : 'Title';
          const descKey = isKR ? '내용' : 'Description';
          const rolesKey = isKR ? '모집 분야' : 'Roles';
          const durationKey = isKR ? '예상 기간' : 'Duration';
          const countryKey = isKR ? '국가' : 'Country';
          const linkKey = isKR ? '참고 정보' : 'Link';

          const li = document.createElement('li');
          li.innerHTML = `
            <h3>${post[titleKey]}</h3>
            <p>${post[descKey]}</p>
            <p><strong>🌍 Country:</strong> ${post[countryKey]}</p>
            <p><strong>📆 Duration:</strong> ${post[durationKey]}</p>
            <p><strong>🧑‍💻 Roles:</strong> ${post[rolesKey]}</p>
            ${post[linkKey] ? `<p><a href="${post[linkKey]}" target="_blank">🔗 More Info</a></p>` : ""}
          `;
          ul.appendChild(li);
        });
        renderPagination(filtered.length);
      }, 300);
    }

    function loadPosts() {
      const ul = document.getElementById('post-list');
      ul.innerHTML = '<li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li>';

      const country = document.getElementById('country-filter').value;
      const url = 'https://script.google.com/macros/s/AKfycbwHoe5QiK6ee56qLgMB1G7gfRR36QwQXpXDJj2urIvZb0lM7oykUWe-q5vbMV9kKhmA/exec?country='+country;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          allData = data;
          currentPage = 1;
          renderPosts();
        });
    }

    document.getElementById('country-filter').addEventListener('change', () => {
      currentPage = 1;
      loadPosts();
    });

    document.getElementById('type-filter').addEventListener('change', () => {
      currentPage = 1;
      renderPosts();
    });

    document.querySelectorAll('#category-checkboxes input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        currentPage = 1;
        renderPosts();
      });
    });

    document.getElementById('search-input').addEventListener('input', () => {
      currentPage = 1;
      renderPosts();
    });

    window.addEventListener('DOMContentLoaded', () => {
      const lang = navigator.language || navigator.userLanguage;
      const countryMap = {
        'ko': '대한민국',
        'ja': '日本',
        'zh': '中国',
        'th': 'ไทย',
        'vi': 'Việt Nam',
        'id': 'Indonesia',
        'en': 'United States',
        'fr': 'Français',
        'es': 'España',
        'de': 'Deutschland',
        'ru': 'Россия',
        'pt': 'Brasil',
        'tr': 'Türkiye'
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