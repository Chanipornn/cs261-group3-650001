async function loadBestSellers() {
  try {
    const res1 = await fetch("http://localhost:8081/api/best-seller");
    const bestSellers = await res1.json();

    if (!Array.isArray(bestSellers) || bestSellers.length === 0) return;

    const res2 = await fetch("http://localhost:8081/api/menu");
    const menus = await res2.json();

    const menuMap = {};
    menus.forEach(m => {
      menuMap[m.id] = m;
    });

    const container = document.getElementById("best-sellers-list");
    container.innerHTML = "";

    const top3 = bestSellers.sort((a,b) => b.totalSales - a.totalSales).slice(0,3);

    top3.forEach(bs => {
      const menu = menuMap[bs.menuId];
      if (!menu) return;

      const item = document.createElement("div");
      item.className = "menu-item";
      item.innerHTML = `
        <div class="image-box">
          <img src="${menu.image}" alt="${menu.name}">
        </div>
        <div class="menu-info">
          <p>${menu.name}</p>
          <a href="detail.html?id=${menu.id}" class="arrow-link">➜</a>
        </div>
      `;
      container.appendChild(item);
    });

  } catch (err) {
    console.error("Error loading best sellers:", err);
  }
  menuList.addEventListener("click", (event) => {
      const menuItem = event.target.closest(".menu-item");
      if (!menuItem) return;

      if (event.target.classList.contains("arrow-link")) {
        const id = menuItem.dataset.id;
        if (id) {
          window.location.href = `http://localhost:8081/Detail.html?id=${id}`;
        }
      }
    });
}

loadBestSellers();
