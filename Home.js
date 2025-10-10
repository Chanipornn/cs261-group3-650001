(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.querySelector('.cart-badge');

  // โหลด cart จาก localStorage
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.warn('โหลด cart ผิดพลาด, เริ่มใหม่:', e);
      return {};
    }
  }

  const cart = loadCart();

  function createQtyControl(count) {
    const wrapper = document.createElement('div');
    wrapper.className = 'qty-control';
    const span = document.createElement('span');
    span.className = 'count';
    span.textContent = String(count);
    wrapper.appendChild(span);
    return wrapper;
  }

  function updateItemUI(itemEl, itemId) {
    const box = itemEl.querySelector('.image-box');
    const existingAdd = box.querySelector('.add-btn');
    const existingQty = box.querySelector('.qty-control');
    const count = cart[itemId] || 0;

    if (count > 0) {
      // แสดง qty-control พร้อมปุ่ม +/−
      if (!existingQty) {
        const wrapper = document.createElement('div');
        wrapper.className = 'qty-control';

        const btnMinus = document.createElement('button');
        btnMinus.type = 'button';
        btnMinus.className = 'minus';
        btnMinus.textContent = '−';

        const span = document.createElement('span');
        span.className = 'count';
        span.textContent = String(count);

        const btnPlus = document.createElement('button');
        btnPlus.type = 'button';
        btnPlus.className = 'plus';
        btnPlus.textContent = '+';

        wrapper.appendChild(btnMinus);
        wrapper.appendChild(span);
        wrapper.appendChild(btnPlus);

        if (existingAdd) existingAdd.remove();
        box.appendChild(wrapper);
      } else {
        // อัปเดตจำนวน
        existingQty.querySelector('.count').textContent = String(count);
      }
    } else {
      // ถ้า count = 0 แสดงปุ่ม + เดิม
      if (!existingAdd) {
        const addBtn = document.createElement('div');
        addBtn.className = 'add-btn';
        addBtn.dataset.action = 'add';
        addBtn.textContent = '+';
        if (existingQty) existingQty.remove();
        box.appendChild(addBtn);
      } else {
        if (existingQty) existingQty.remove();
      }
    }
  }

  function updateCartBadge() {
    if (!cartBadge) return;
    const total = Object.values(cart).reduce((s, v) => s + v, 0);
    if (total > 0) {
      cartBadge.textContent = String(total);
      cartBadge.style.display = 'inline-block';
    } else {
      cartBadge.style.display = 'none';
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('ไม่สามารถบันทึก localStorage:', e);
    }
  }

  // --- Initialize existing items & cart ---
  document.querySelectorAll('.menu-item').forEach(mi => {
    const id = mi.dataset.id;
    if (!(id in cart)) cart[id] = 0;
    updateItemUI(mi, id);
  });
  updateCartBadge();

  // --- Helper: go to detail page for an item ---
  function goToDetailPageFor(menuItem) {
    const id = menuItem.dataset.id;
    const name = (menuItem.querySelector('p') || {}).textContent || '';
    const priceText = (menuItem.querySelector('.price') || {}).textContent || '';

    try {
      localStorage.setItem('pending_add', JSON.stringify({ id, name, priceText }));
    } catch (e) {
      console.warn('ไม่สามารถเขียน pending_add:', e);
    }

    window.location.href = `Detail.html?id=${encodeURIComponent(id)}`;
  }

  // --- Cart click handlers ---
  menuList.addEventListener('click', function (e) {
    const addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) {
      const menuItem = addBtn.closest('.menu-item');
      if (!menuItem) return;

      const id = String(menuItem.dataset.id);

      // ถ้าเป็นข้าวสวย (id === '1') เพิ่มทันที
      if (id === '1') {
        cart[id] = (cart[id] || 0) + 1;
        updateItemUI(menuItem, id);
        saveCart();
        updateCartBadge();
        return;
      }

      // เมนูอื่นไป Detail
      goToDetailPageFor(menuItem);
      return;
    }
  });

  // ตะกร้าเซ็ตใหม่ทุกครั้งที่รีเฟรช
  if (performance.getEntriesByType("navigation")[0].type === "reload") {
    localStorage.removeItem(STORAGE_KEY);
  }

  // --- Search ---
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      const q = (e.target.value || '').trim().toLowerCase();
      document.querySelectorAll('.menu-item').forEach(menuItem => {
        const nameEl = menuItem.querySelector('p');
        const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
        menuItem.style.display = (q === '' || name.includes(q)) ? '' : 'none';
      });
    });
  }

  // --- Reload cart UI on back/forward ---
  window.addEventListener('pageshow', function () {
    const fresh = loadCart();
    Object.keys(cart).forEach(k => delete cart[k]);
    Object.assign(cart, fresh || {});
    document.querySelectorAll('.menu-item').forEach(mi => updateItemUI(mi, mi.dataset.id));
    updateCartBadge();
  });
})();
