document.addEventListener("DOMContentLoaded", () => {
  const menuList = document.querySelector(".menu-list");
  const searchInput = document.querySelector(".search-box input");
  let allMenus = []; // keep all menu from fetchMenu.js
  // ===== fetch Menu =====
  fetch('http://localhost:8081/api/menu')
    .then(res => res.json())
    .then(data => {
      allMenus = data
	  .filter(item => item.categoryId === 1) // only categoryId == 1
	  .map(item => ({
	            ...item,
	            nameTH: nameMap[item.name] || item.name // add thai name
	  }));
      renderMenu(allMenus); // render menu
    })
    .catch(err => console.error('Fetch error:', err));

  // ===== function show menu =====
  function renderMenu(menus) {
    menuList.innerHTML = ''; // clear first
    if (!menus.length) {
      menuList.innerHTML = '<p style="text-align:center;">ไม่พบเมนูที่ค้นหา</p>';
      return;
    }

    for (const item of menus) {
      const div = document.createElement('div');
      div.classList.add('menu-item');
      div.dataset.id = item.id;

      div.innerHTML = `
        <div class="image-box">
          <img src="${item.image}" alt="${item.nameTH}">
          <div class="add-btn" data-action="add">+</div>
        </div>
        <p>${item.nameTH}</p>
        <p class="price">${item.price} บาท</p>
      `;

      menuList.appendChild(div);
    }
  }

  // ===== searchMenu =====
  function searchMenu(keyword) {
    const filtered = allMenus.filter(item =>
      item.nameTH.toLowerCase().includes(keyword.toLowerCase())
    );
    renderMenu(filtered);
  }

  // Searching(render) while typing
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.trim();
    searchMenu(keyword);
  });

  // ===== Go to Detail when click + =====
  menuList.addEventListener("click", (event) => {
    const menuItem = event.target.closest(".menu-item");
    if (!menuItem) return;

    if (event.target.classList.contains("add-btn")) {
      const id = menuItem.dataset.id;
      if (id) {
        window.location.href = `http://localhost:8081/Detail.html?id=${id}`;
      }
    }
  });
});
