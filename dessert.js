(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.querySelector('.cart-badge');

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      for (const k of Object.keys(data)) data[k] = Math.max(0, Number(data[k] || 0));
      return data;
    } catch (e) {
      console.warn('[Dessert] โหลด cart ผิดพลาด, เริ่มใหม่:', e);
      return {};
    }
  }
  const cart = loadCart();

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    catch (e) { console.warn('[Dessert] ไม่สามารถบันทึก localStorage:', e); }
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

  // init tiles
  document.querySelectorAll('.menu-item').forEach(mi => {
    const id = String(mi.dataset.id || '');
    if (!id) return;
    if (!(id in cart)) cart[id] = 0;
    updateItemUI(mi, id);
  });
  updateCartBadge();

  // handlers (+ / −) — ไม่มีปุ่ม Add ที่นี่
  if (menuList) {
    menuList.addEventListener('click', function (e) {
      const plus = e.target.closest('.qty-control .plus');
      if (plus) {
        const menuItem = plus.closest('.menu-item');
        const id = String(menuItem?.dataset.id || '');
        if (!id) return;
        cart[id] = (Number(cart[id]) || 0) + 1;
        updateItemUI(menuItem, id); saveCart(); updateCartBadge();
        return;
      }

      const minus = e.target.closest('.qty-control .minus');
      if (minus) {
        const menuItem = minus.closest('.menu-item');
        const id = String(menuItem?.dataset.id || '');
        if (!id) return;
        cart[id] = Math.max(0, (Number(cart[id]) || 0) - 1);
        updateItemUI(menuItem, id); saveCart(); updateCartBadge();
        return;
      }
    });
  }

  // search
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

  // sync on back
  window.addEventListener('pageshow', function () {
    const fresh = loadCart();
    Object.keys(cart).forEach(k => delete cart[k]);
    Object.assign(cart, fresh || {});
    document.querySelectorAll('.menu-item').forEach(mi => {
      const id = String(mi.dataset.id || '');
      if (!id) return;
      updateItemUI(mi, id);
    });
    updateCartBadge();
  });
})();
