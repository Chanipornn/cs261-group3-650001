(function () {
  const CART_KEY = 'cart'; // ✅ ใช้ cart เดียวกับ Summary
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.getElementById('cartBadge');

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

  // ✅ ใช้ cart array
  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn('[Home] โหลด cart ผิดพลาด:', e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('[Home] บันทึก cart ผิดพลาด:', e);
    }
  }

  function updateCartBadge() {
    if (!cartBadge) return;
    const cart = loadCart();
    const total = cart.reduce((s, item) => s + Number(item.qty || 0), 0);
    cartBadge.style.display = total > 0 ? 'inline-flex' : 'none';
    if (total > 0) cartBadge.textContent = String(total);
  }

  // ✅ ไปหน้า Detail (ไม่มีปุ่ม +/- แล้ว)
  function goToDetailPageFor(menuItem) {
    const id = String(menuItem.dataset.id);
    const menuId = MENU_ID_MAP[id];
    if (!menuId) {
      alert('เมนูนี้ยังไม่ได้ตั้งค่า MENU_ID_MAP (id=' + id + ')');
      return;
    }

    const name = (menuItem.querySelector('p') || {}).textContent || '';
    const priceText = (menuItem.querySelector('.price') || {}).textContent || '';
    const imgSrc = menuItem.querySelector('img')?.getAttribute('src') || '';

    try {
      localStorage.setItem('pending_add', JSON.stringify({
        id: menuId,
        name: name.trim(),
        priceText: priceText.trim(),
        image: imgSrc
      }));
    } catch (e) {
      console.warn('[Home] ไม่สามารถเขียน pending_add:', e);
    }

    window.location.href = `Detail.html?id=${encodeURIComponent(menuId)}`;
  }

  updateCartBadge();

  // ✅ กด + → ไป Detail ทันที (ไม่มีปุ่ม +/- บนการ์ด)
  if (menuList) {
    menuList.addEventListener('click', function (e) {
      const addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        const menuItem = addBtn.closest('.menu-item');
        if (!menuItem) return;
        goToDetailPageFor(menuItem);
        return;
      }
    });
  }

  // ✅ ค้นหาเมนู
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

  // ✅ รีเฟรชเมื่อกลับจาก Detail
  window.addEventListener('pageshow', function () {
    try {
      localStorage.removeItem('pending_add');
      updateCartBadge();
      console.log('[Home] cart badge refreshed');
    } catch (e) {
      console.error('[Home] pageshow error', e);
    }
  });
})();