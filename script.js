let allData = [];
let currentPage = 1;
const postsPerPage = 10;
let sortAscending = true;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("country-filter").addEventListener("change", loadPosts);
  document.getElementById("type-filter").addEventListener("change", renderPosts);
  document.getElementById("search-input").addEventListener("input", renderPosts);
  document.querySelectorAll("#category-checkboxes input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", renderPosts);
  });
  document.querySelector("th[data-sort='date']").addEventListener("click", () => {
    sortAscending = !sortAscending;
    renderPosts();
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
  });

  window.addEventListener("click", e => {
    if (e.target === document.getElementById("modal")) {
      document.getElementById("modal").classList.add("hidden");
    }
  });

  loadPosts();
});

function loadPosts() {
  const ul = document.getElementById("post-list");
  ul.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  const country = document.getElementById("country-filter").value;
  const url = `https://script.google.com/macros/s/AKfycbx3ewEIrfN2JivG1ebq9aMWWOk4JNMUl9jIgCKZulX8yAyzO_vYbp9TtEqLZx6a--Rp/exec?country=${country}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      allData = data;
      currentPage = 1;
      renderPosts();
    });
}

function renderPosts() {
  const keyword = document.getElementById("search-input").value.toLowerCase();
  const type = document.getElementById("type-filter").value.toLowerCase();
  const selectedCats = Array.from(document.querySelectorAll("#category-checkboxes input:checked")).map(cb => cb.value);
  const country = document.getElementById("country-filter").value;

  const filtered = allData.filter(post => {
    const isKR = post["국가"] === "대한민국";
    const title = isKR ? post["제목"] : post["Title"];
    const desc = isKR ? post["내용"] : post["Description"];
    const roles = isKR ? post["모집 분야"] : post["Roles"];
    const typeField = isKR ? post["구분"] : post["Type"];
    const countryField = isKR ? post["국가"] : post["Country"];

    const matchesKeyword = !keyword || (title && title.toLowerCase().includes(keyword)) || (desc && desc.toLowerCase().includes(keyword)) || (roles && roles.toLowerCase().includes(keyword));
    const matchesCategory = selectedCats.length === 0 || selectedCats.some(cat => roles?.includes(cat));
    const matchesType = !type || (typeField && typeField.toLowerCase().includes(type));
    const matchesCountry = !country || (countryField && countryField.includes(country));

    return matchesKeyword && matchesCategory && matchesType && matchesCountry;
  });

  filtered.sort((a, b) => {
    const isKR = a["국가"] === "대한민국";
    const dateA = new Date(isKR ? a["등록일"] : a["Date"]);
    const dateB = new Date(isKR ? b["등록일"] : b["Date"]);
    return sortAscending ? dateA - dateB : dateB - dateA;
  });

  const start = (currentPage - 1) * postsPerPage;
  const pageData = filtered.slice(start, start + postsPerPage);

  const list = document.getElementById("post-list");
  list.innerHTML = "";

  if (pageData.length === 0) {
    list.innerHTML = '<tr><td colspan="4">No results found.</td></tr>';
  } else {
    pageData.forEach(post => {
        const isKR = post["국가"] === "대한민국";
        const title = isKR ? post["제목"] : post["Title"];
        const roles = isKR ? post["모집 분야"] : post["Roles"];
        const duration = isKR ? post["예상 기간"] : post["Duration"];
        const dateRaw = isKR ? post["등록일"] : post["Date"];
        const timestamp = post["타임스탬프"];
        const date = dateRaw || (timestamp ? new Date(timestamp).toISOString().split('T')[0] : '');

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${date}</td>
        <td class="clickable" data-title="${title}" data-date="${date}">${title}</td>
        <td>${roles}</td>
        <td>${duration}</td>
        `;
        
        tr.addEventListener("click", () => showModal(post));
        list.appendChild(tr);
    });
  }

  renderPagination(filtered.length);
}

function renderPagination(totalItems) {
  const pageCount = Math.ceil(totalItems / postsPerPage);
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPosts();
    });
    container.appendChild(btn);
  }
}

function autoLinkify(text) {
    const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=]+)/gi;
    return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

function showModal(post) {
    const isKR = post["국가"] === "대한민국";
    const title = isKR ? post["제목"] : post["Title"];
    const desc = isKR ? post["내용"] : post["Description"];
    const roles = isKR ? post["모집 분야"] : post["Roles"];
    const duration = isKR ? post["예상 기간"] : post["Duration"];
    const link = isKR ? post["참고 링크"] : post["Link"];
    const contact = isKR ? post["연락처"] : post["Contact"];
    const date = isKR ? post["등록일"] || post["타임스탬프"] : post["Date"];

    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = `
    <h2>${title}</h2>
    <p><strong>📅 Date:</strong> ${date}</p>
    <p><strong>🧑‍💻 Roles:</strong> ${roles}</p>
    <p><strong>🕒 Duration:</strong> ${duration}</p>
    <p><strong>📬 Contact:</strong> ${autoLinkify(contact || "")}</p>
    <p><strong>📄 Description:</strong><br>${autoLinkify(desc || "")}</p>
    ${link ? `<p><a href="${link}" target="_blank">🔗 More Info</a></p>` : ""}
    `;

    document.getElementById("modal").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.querySelector(".modal .close");
    if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        document.getElementById("modal").classList.add("hidden");
    });
    }
});

function formatDateString(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'만 추출
}

