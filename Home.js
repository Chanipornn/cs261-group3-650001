(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList = document.querySelector('.menu-list');

  const cartBadge = document.querySelector('.cart-badge');

  const cart = loadCart();

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
    const existingAdd = box.querySelector('.add-btn');
    const existingQty = box.querySelector('.qty-control');
    const count = cart[itemId] || 0;

    if (count > 0) {
      if (!existingQty) {
        const qtyControl = createQtyControl(count);
        if (existingAdd) existingAdd.remove();
        box.appendChild(qtyControl);
      } else {
        existingQty.querySelector('.count').textContent = String(count);
      }
    } else {
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

  // --- Initialize existing items & cart ---
  document.querySelectorAll('.menu-item').forEach(mi => {
    const id = mi.dataset.id;
    if (!(id in cart)) cart[id] = 0;
    updateItemUI(mi, id);
  });
  updateCartBadge();

  // --- Cart click handlers ---
  menuList.addEventListener('click', function (e) {
    const addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) {
      const menuItem = addBtn.closest('.menu-item');
      const id = menuItem.dataset.id;
      cart[id] = (cart[id] || 0) + 1;
      updateItemUI(menuItem, id);
      saveCart();
      updateCartBadge();
      return;
    }

    const plus = e.target.closest('.qty-control .plus');
    if (plus) {
      const menuItem = plus.closest('.menu-item');
      const id = menuItem.dataset.id;
      cart[id] = (cart[id] || 0) + 1;
      updateItemUI(menuItem, id);
      saveCart();
      updateCartBadge();
      return;
    }

    const minus = e.target.closest('.qty-control .minus');
    if (minus) {
      const menuItem = minus.closest('.menu-item');
      const id = menuItem.dataset.id;
      cart[id] = Math.max(0, (cart[id] || 0) - 1);
      updateItemUI(menuItem, id);
      saveCart();
      updateCartBadge();
      return;
    }
  });

  

  // --- SEARCH: filter เมนูตามคีย์เวิร์ดใน input ---
  // ใช้ selector เดียวกับ input ใน HTML (ถ้าเปลี่ยน class ของ input ให้แก้ selector ในบรรทัดล่าง)
  const searchInput = document.querySelector('.search-box input');

  if (searchInput) {
    // ตัวกรองแบบเรียลไทม์: เมื่อพิมพ์ ให้โชว์เฉพาะเมนูที่ชื่อมีคำที่ค้นหา (ไม่สนตัวพิมพ์)
    searchInput.addEventListener('input', function (e) {
      const q = (e.target.value || '').trim().toLowerCase();

      // วนทุกเมนู ถ้า match ให้โชว์ ถ้าไม่ match ให้ซ่อน
      document.querySelectorAll('.menu-item').forEach(menuItem => {
        // สมมติชื่อเมนูอยู่ใน <p> แรกของ .menu-item
        const nameEl = menuItem.querySelector('p');
        const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';

        if (q === '' || name.includes(q)) {
          menuItem.style.display = ''; // แสดง (คืนค่า default)
        } else {
          menuItem.style.display = 'none'; // ซ่อน
        }
      });
    });
  }

})();
