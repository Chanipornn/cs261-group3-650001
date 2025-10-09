(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.querySelector('.cart-badge');

  // ==============================
  // ✅ MAP data-id → menuId ใน Detail.js
  // ==============================
  const MENU_ID_MAP = {
    "1":"rice_plain",

    "2":"kapow_moosub",
    "3":"kapow_moodeng",
    "4":"kapow_squid",
    "5":"kapow_moogrob",
    "6":"kapow_gai",
    "7":"kapow_shrimp",

    "8":"prikgaeng_pork",
    "9":"prikgaeng_chicken",
    "10":"prikgaeng_beef",

    "11":"kana_moogrob",
    "12":"khaenang_moogrob",
    "13":"morning_glory",
    "14":"mixed_veg",

    "15":"curry_squid",
    "16":"curry_shrimp",
    "17":"curry_chicken",

    "18":"garlic_pork",
    "19":"garlic_chicken",
    "20":"oyster_pork",
    "21":"chilipork_caps",
    "22":"chilichicken_caps",

    "23":"sweet_sour_pork",
    "24":"sweet_sour_fish",

    "25":"kee_mao_pork",
    "26":"kee_mao_chicken",
    "27":"kee_mao_beef",
    "28":"kee_mao_sea",

    "29":"spaghetti_kee_mao",

    "30":"kai_omelet_rice",
    "31":"omelet_shrimp",
    "32":"omelet_pork",
    "33":"omelet_crab",

    "34":"fried_rice_pork",
    "35":"fried_rice_shrimp",
    "36":"fried_rice_sea",
    "37":"fried_rice_canned_fish",

    "38":"pad_see_ew_pork",
    "39":"rad_na_pork",
    "40":"pad_thai_shrimp",

    "41":"tom_jued_pork",

    "42":"suki_water_pork",
    "43":"suki_water_sea",
    "44":"suki_dry_pork",

    "45":"yum_mu_yo",
    "46":"yum_woonsen_sea",
    "47":"yum_canned_fish",

    "48":"khao_tom_shrimp",
    "49":"khao_tom_pork",
    "50":"khao_tom_fish"
  };

  // ==============================
  // 🛒 LocalStorage Cart
  // ==============================
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

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('ไม่สามารถบันทึก localStorage:', e);
    }
  }

  const cart = loadCart();

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

  // ==============================
  // 🧩 UI สลับ Add / Qty
  // ==============================
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

  // ==============================
  // 📦 โหลดครั้งแรก
  // ==============================
  document.querySelectorAll('.menu-item').forEach(mi => {
    const id = mi.dataset.id;
    if (!(id in cart)) cart[id] = 0;
    updateItemUI(mi, id);
  });
  updateCartBadge();

  // ==============================
  // 🔗 ไปหน้า Detail
  // ==============================
  function goToDetailPageFor(menuItem) {
    const id = menuItem.dataset.id;
    const menuId = MENU_ID_MAP[id];
    if (!menuId) {
      alert('เมนูนี้ยังไม่ได้ตั้งค่า MENU_ID_MAP (id=' + id + ')');
      return;
    }

    const name = (menuItem.querySelector('p') || {}).textContent || '';
    const priceText = (menuItem.querySelector('.price') || {}).textContent || '';

    // เก็บไว้ให้หน้า Detail ใช้
    try {
      localStorage.setItem('pending_add', JSON.stringify({
        id: menuId,
        name: name.trim(),
        priceText: priceText.trim()
      }));
    } catch (e) {
      console.warn('ไม่สามารถเขียน pending_add:', e);
    }

    // ไปหน้า Detail
    window.location.href = `Detail.html?id=${encodeURIComponent(menuId)}`;
  }

  // ==============================
  // 🖱 จัดการคลิก Add / + / −
  // ==============================
  menuList.addEventListener('click', function (e) {
    const addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) {
      const menuItem = addBtn.closest('.menu-item');
      const id = String(menuItem.dataset.id);
      const menuId = MENU_ID_MAP[id];

      // “ข้าวสวย” (id=1) → เพิ่มจำนวนทันทีไม่ต้องไปหน้า Detail
      if (menuId === 'rice_plain') {
        cart[id] = (cart[id] || 0) + 1;
        updateItemUI(menuItem, id);
        saveCart(cart);
        updateCartBadge();
        return;
      }

      // เมนูอื่น → ไปหน้า Detail
      goToDetailPageFor(menuItem);
      return;
    }

    // ปุ่ม +
    const plus = e.target.closest('.qty-control .plus');
    if (plus) {
      const menuItem = plus.closest('.menu-item');
      const id = menuItem.dataset.id;
      cart[id] = (cart[id] || 0) + 1;
      updateItemUI(menuItem, id);
      saveCart(cart);
      updateCartBadge();
      return;
    }

    // ปุ่ม −
    const minus = e.target.closest('.qty-control .minus');
    if (minus) {
      const menuItem = minus.closest('.menu-item');
      const id = menuItem.dataset.id;
      cart[id] = Math.max(0, (cart[id] || 0) - 1);
      updateItemUI(menuItem, id);
      saveCart(cart);
      updateCartBadge();
      return;
    }
  });

  // ==============================
  // 🔍 ค้นหาเมนู
  // ==============================
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

  // ==============================
  // ♻️ รีเฟรชหน้าเมื่อกลับจาก Detail
  // ==============================
  window.addEventListener('pageshow', function () {
    const fresh = loadCart();
    Object.keys(cart).forEach(k => delete cart[k]);
    Object.assign(cart, fresh || {});
    document.querySelectorAll('.menu-item').forEach(mi => updateItemUI(mi, mi.dataset.id));
    updateCartBadge();
  });
})();