(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.querySelector('.cart-badge');

  const MENU_ID_MAP = {
    "1":"rice_plain","2":"kapow_moosub","3":"kapow_moodeng","4":"kapow_squid","5":"kapow_moogrob",
    "6":"kapow_gai","7":"kapow_shrimp","8":"prikgaeng_pork","9":"prikgaeng_chicken","10":"prikgaeng_beef",
    "11":"kana_moogrob","12":"khaenang_moogrob","13":"morning_glory","14":"mixed_veg","15":"curry_squid",
    "16":"curry_shrimp","17":"curry_chicken","18":"garlic_pork","19":"garlic_chicken","20":"oyster_pork",
    "21":"chilipork_caps","22":"chilichicken_caps","23":"sweet_sour_pork","24":"sweet_sour_fish","25":"kee_mao_pork",
    "26":"kee_mao_chicken","27":"kee_mao_beef","28":"kee_mao_sea","29":"spaghetti_kee_mao","30":"kai_omelet_rice",
    "31":"omelet_shrimp","32":"omelet_pork","33":"omelet_crab","34":"fried_rice_pork","35":"fried_rice_shrimp",
    "36":"fried_rice_sea","37":"fried_rice_canned_fish","38":"pad_see_ew_pork","39":"rad_na_pork",
    "40":"pad_thai_shrimp","41":"tom_jued_pork","42":"suki_water_pork","43":"suki_water_sea","44":"suki_dry_pork",
    "45":"yum_mu_yo","46":"yum_woonsen_sea","47":"yum_canned_fish","48":"khao_tom_shrimp","49":"khao_tom_pork",
    "50":"khao_tom_fish"
  };

  // ==============================
  // 🛒 LocalStorage Cart
  // ==============================
  const cart = loadCart();

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('โหลด cart ผิดพลาด, เริ่มใหม่:', e);
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('ไม่สามารถบันทึก localStorage:', e);
    }
  }

  function updateCartBadge() {
    if (!cartBadge) return;
    const total = Object.values(cart).reduce((s, v) => s + v, 0);
    cartBadge.style.display = total > 0 ? 'inline-block' : 'none';
    if (total > 0) cartBadge.textContent = String(total);
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
    btnMinus.textContent = '-';

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
    const count = cart[itemId] || 0;

    if (count > 0) {
      if (!existingQty) {
        const qty = createQtyControl(count);
        if (existingAdd) existingAdd.remove();
        box.appendChild(qty);
      } else {
        const cntEl = existingQty.querySelector('.count');
        if (cntEl) cntEl.textContent = String(count);
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
    const id = String(menuItem.dataset.id);
    const menuId = MENU_ID_MAP[id];
    if (!menuId) {
      alert('เมนูนี้ยังไม่ได้ตั้งค่า MENU_ID_MAP (id=' + id + ')');
      return;
    }

    const name = (menuItem.querySelector('p') || {}).textContent || '';
    const priceText = (menuItem.querySelector('.price') || {}).textContent || '';

    try {
      localStorage.setItem('pending_add', JSON.stringify({
        id: menuId,
        name: name.trim(),
        priceText: priceText.trim()
      }));
    } catch (e) {
      console.warn('ไม่สามารถเขียน pending_add:', e);
    }

    window.location.href = `Detail.html?id=${encodeURIComponent(menuId)}`;
  }

  // ==============================
  // 🖱 จัดการคลิก Add / + / −
  // ==============================
  if (menuList) {
    menuList.addEventListener('click', function (e) {
      const addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        const menuItem = addBtn.closest('.menu-item');
        if (!menuItem) return;
        const id = String(menuItem.dataset.id);
        const menuId = MENU_ID_MAP[id];
        if (menuId === 'rice_plain') {
          cart[id] = (cart[id] || 0) + 1;
          updateItemUI(menuItem, id);
          saveCart();
          updateCartBadge();
          return;
        }
        goToDetailPageFor(menuItem);
        return;
      }

      const plus = e.target.closest('.qty-control .plus');
      if (plus) {
        const menuItem = plus.closest('.menu-item');
        if (!menuItem) return;
        const id = String(menuItem.dataset.id);
        const menuId = MENU_ID_MAP[id];
        if (menuId === 'rice_plain') {
          cart[id] = (cart[id] || 0) + 1;
          updateItemUI(menuItem, id);
          saveCart();
          updateCartBadge();
          return;
        } else {
          goToDetailPageFor(menuItem);
          return;
        }
      }

      const minus = e.target.closest('.qty-control .minus');
      if (minus) {
        const menuItem = minus.closest('.menu-item');
        if (!menuItem) return;
        const id = String(menuItem.dataset.id);
        cart[id] = Math.max(0, (cart[id] || 0) - 1);
        updateItemUI(menuItem, id);
        saveCart();
        updateCartBadge();
        return;
      }
    });
  }

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
  // ♻️ รีเฟรชหน้าจอเมื่อกลับจาก Detail
  // ==============================
  window.addEventListener('pageshow', function () {
    try {
      const fresh = loadCart();
      Object.keys(cart).forEach(k => delete cart[k]);
      Object.assign(cart, fresh || {});
      console.log('[pageshow] loaded cart', cart);

      const pendingRaw = localStorage.getItem('pending_add');
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          console.log('[pageshow] pending_add', pending);

          const pendingIdRaw = pending.id || '';
          const qty = Math.max(1, Number(pending.qty || pending.amount || 1));
          let menuIdKey = null;

          if (String(pendingIdRaw) in cart) {
            menuIdKey = String(pendingIdRaw);
          } else {
            menuIdKey = Object.keys(MENU_ID_MAP).find(k => MENU_ID_MAP[k] === String(pendingIdRaw));
          }

          if (menuIdKey) {
            cart[menuIdKey] = (cart[menuIdKey] || 0) + qty;
            saveCart();
            console.log('[pageshow] incremented', menuIdKey, qty);
          } else {
            console.warn('[pageshow] ไม่พบ mapping สำหรับ pending.id=', pendingIdRaw);
          }

          localStorage.removeItem('pending_add');
        } catch (e) {
          console.warn('pending_add parse error', e, pendingRaw);
          try { localStorage.removeItem('pending_add'); } catch (_) {}
        }
      } else {
        console.log('[pageshow] no pending_add');
      }

      document.querySelectorAll('.menu-item').forEach(mi => updateItemUI(mi, mi.dataset.id));
      updateCartBadge();
    } catch (e) {
      console.error('[pageshow] unexpected error', e);
    }
  });
})();
