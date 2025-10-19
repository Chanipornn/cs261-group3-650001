(function () {
  const CART_KEY = 'cart'; // ✅ ใช้ cart เดียวกับ Summary
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.getElementById('cartBadge');

  // 🧹 ลบการใช้ MENU_ID_MAP ออก เพราะเราดึง id จาก DB แล้ว
  // const MENU_ID_MAP = {...};

  // ✅ โหลด / บันทึก cart จาก localStorage
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

  // ✅ ไปหน้า Detail โดยใช้ id จาก DB ตรง ๆ
  function goToDetailPageFor(menuItem) {
    const menuId = Number(menuItem.dataset.id); // ใช้ id จาก DB (เป็นตัวเลข)

    if (!menuId || isNaN(menuId)) {
      alert('ไม่พบรหัสเมนูจากฐานข้อมูล');
      return;
    }

    const name = (menuItem.querySelector('p') || {}).textContent || '';
    const priceText = (menuItem.querySelector('.price') || {}).textContent || '';
    const imgSrc = menuItem.querySelector('img')?.getAttribute('src') || '';

    try {
      localStorage.setItem(
        'pending_add',
        JSON.stringify({
          id: menuId, // ✅ เก็บ id จริงจาก DB
          name: name.trim(),
          priceText: priceText.trim(),
          image: imgSrc,
        })
      );
    } catch (e) {
      console.warn('[Home] ไม่สามารถเขียน pending_add:', e);
    }

    // ✅ ส่ง id จริงใน query param ด้วย
    window.location.href = `Detail.html?id=${encodeURIComponent(menuId)}`;
  }

  updateCartBadge();

  // ✅ คลิกปุ่ม + แล้วไปหน้า Detail ทันที
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

  // ✅ ค้นหาเมนูแบบเรียลไทม์
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      const q = (e.target.value || '').trim().toLowerCase();
      document.querySelectorAll('.menu-item').forEach((menuItem) => {
        const nameEl = menuItem.querySelector('p');
        const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
        menuItem.style.display = q === '' || name.includes(q) ? '' : 'none';
      });
    });
  }

  // ✅ รีเฟรช badge เมื่อกลับจากหน้า Detail
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
