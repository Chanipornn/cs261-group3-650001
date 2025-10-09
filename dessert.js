(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList = document.querySelector('.menu-list');

  const cartBadge = document.querySelector('.cart-badge');

  // loadCart ถูกประกาศก่อนใช้
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

    // เก็บข้อมูลชั่วคราวไว้ใช้ที่หน้า Detail (หรือหน้า add)
    try {
      localStorage.setItem('pending_add', JSON.stringify({
        id,
        name,
        priceText
      }));
    } catch (e) {
      console.warn('ไม่สามารถเขียน pending_add:', e);
    }

    // ไปยังหน้ารายละเอียด พร้อม query param id (Detail.html อ่าน id หรือ pending_add ได้)
    window.location.href = `dessertdetail.html?id=${encodeURIComponent(id)}`;
  }

  // --- Cart click handlers ---
  menuList.addEventListener('click', function (e) {
    // ถ้าคลิกที่ปุ่ม add (dataset action="add")
    const addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) {
      const menuItem = addBtn.closest('.menu-item');
      if (!menuItem) return;
      const id = String(menuItem.dataset.id);

      // เมนูอื่น ๆ ให้ไปหน้า detail (เก็บ pending_add ก่อน)
      goToDetailPageFor(menuItem);
      return;
    }

    // กด + ที่ qty-control (ถ้ามี) ให้เพิ่ม
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

    // กด - ที่ qty-control (ถ้ามี) ให้ลด
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

  // --- เมื่อกลับมาหน้าจาก history (back/forward) ให้รีโหลด cart จาก localStorage เพื่ออัปเดต UI ---
  window.addEventListener('pageshow', function () {
    const fresh = loadCart();
    // คัดลอกค่าใหม่เข้า cart object ปัจจุบัน
    Object.keys(cart).forEach(k => delete cart[k]); // ล้างเดิม
    Object.assign(cart, fresh || {});
    // อัปเดต UI ทุกเมนู
    document.querySelectorAll('.menu-item').forEach(mi => updateItemUI(mi, mi.dataset.id));
    updateCartBadge();
  });

})();
