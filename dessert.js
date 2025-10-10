(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.querySelector('.cart-badge');

  // โหลด cart เป็น map: { [data-id]: number }
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      // ต้องเป็น object เท่านั้น
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      // บังคับทุกค่าเป็น number ≥ 0
      for (const k of Object.keys(data)) {
        data[k] = Math.max(0, Number(data[k] || 0));
      }
      return data;
    } catch (e) {
      console.warn('[Dessert] โหลด cart ผิดพลาด, เริ่มใหม่:', e);
      return {};
    }
  }

  const cart = loadCart();

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('[Dessert] ไม่สามารถบันทึก localStorage:', e);
    }
  }

  function createQtyControl(count) {
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

    return wrapper;
  }

  function updateItemUI(itemEl, itemId) {
    const box = itemEl.querySelector('.image-box');
    if (!box) return;

    const existingAdd = box.querySelector('.add-btn');
    const existingQty = box.querySelector('.qty-control');
    const count = Number(cart[itemId] || 0);

    if (count > 0) {
      if (!existingQty) {
        const qtyControl = createQtyControl(count);
        if (existingAdd) existingAdd.remove();
        box.appendChild(qtyControl);
      } else {
        const cnt = existingQty.querySelector('.count');
        if (cnt) cnt.textContent = String(count);
      }
    } else {
      if (!existingAdd) {
        const addBtn = document.createElement('div');
        addBtn.className = 'add-btn';
        addBtn.dataset.action = 'add';
        addBtn.textContent = '+';
        if (existingQty) existingQty.remove();
        box.appendChild(addBtn);
      } else if (existingQty) {
        existingQty.remove();
      }
    }
  }

  function updateCartBadge() {
    if (!cartBadge) return;
    const total = Object.values(cart).reduce((s, v) => s + Number(v || 0), 0);
    if (total > 0) {
      cartBadge.textContent = String(total);
      cartBadge.style.display = 'inline-block';
    } else {
      cartBadge.style.display = 'none';
    }
  }

  // --- Initialize existing items & cart ---
  document.querySelectorAll('.menu-item').forEach(mi => {
    const id = String(mi.dataset.id || '');
    if (!id) return;
    if (!(id in cart)) cart[id] = 0;
    updateItemUI(mi, id);
  });
  updateCartBadge();

  // --- Helper: ไปหน้า dessertdetail พร้อมเก็บ pending_add ---
  function goToDetailPageFor(menuItem) {
    const id = String(menuItem.dataset.id || '');
    const name = (menuItem.querySelector('p') || {}).textContent || '';
    const priceText = (menuItem.querySelector('.price') || {}).textContent || '';

    try {
      localStorage.setItem('pending_add', JSON.stringify({
        id,
        name,
        priceText
      }));
    } catch (e) {
      console.warn('[Dessert] ไม่สามารถเขียน pending_add:', e);
    }

    window.location.href = `dessertdetail.html?id=${encodeURIComponent(id)}`;
  }

  // --- Cart click handlers ---
  if (menuList) {
    menuList.addEventListener('click', function (e) {
      // ปุ่ม add บนการ์ด → ไปหน้า detail (เพื่อเลือกตัวเลือก)
      const addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        const menuItem = addBtn.closest('.menu-item');
        if (!menuItem) return;
        goToDetailPageFor(menuItem);
        return;
      }

      // กด + เพิ่มจำนวนทันที (สำหรับสินค้าไม่ต้องเลือกตัวเลือก)
      const plus = e.target.closest('.qty-control .plus');
      if (plus) {
        const menuItem = plus.closest('.menu-item');
        const id = String(menuItem?.dataset.id || '');
        if (!id) return;
        cart[id] = (Number(cart[id]) || 0) + 1;
        updateItemUI(menuItem, id);
        saveCart();
        updateCartBadge();
        return;
      }

      // กด − ลดจำนวน
      const minus = e.target.closest('.qty-control .minus');
      if (minus) {
        const menuItem = minus.closest('.menu-item');
        const id = String(menuItem?.dataset.id || '');
        if (!id) return;
        cart[id] = Math.max(0, (Number(cart[id]) || 0) - 1);
        updateItemUI(menuItem, id);
        saveCart();
        updateCartBadge();
        return;
      }
    });
  }

  // --- SEARCH: filter เมนูตามคีย์เวิร์ดใน input ---
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

  // --- เมื่อกลับจาก history: sync cart + อัปเดต UI ---
  window.addEventListener('pageshow', function () {
    const fresh = loadCart();
    Object.keys(cart).forEach(k => delete cart[k]); // ล้างของเดิม
    Object.assign(cart, fresh || {});

    document.querySelectorAll('.menu-item').forEach(mi => {
      const id = String(mi.dataset.id || '');
      if (!id) return;
      updateItemUI(mi, id);
    });
    updateCartBadge();
  });

})();
