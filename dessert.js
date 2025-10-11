(function () {
  const CART_KEY = 'cart'; // ✅ ใช้ cart เดียวกับ Summary
  const menuList = document.querySelector('.menu-list');
  const cartBadge = document.getElementById('cartBadge');

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }

  function updateCartBadge() {
    if (!cartBadge) return;
    const cart = loadCart();
    const total = cart.reduce((s, item) => s + Number(item.qty || 0), 0);
    cartBadge.style.display = total > 0 ? 'inline-flex' : 'none';
    if (total > 0) cartBadge.textContent = String(total);
  }

  // ✅ ไปหน้า detail
  function goToDetailPageFor(menuItem) {
    const id = String(menuItem.dataset.id || '');
    const name = (menuItem.querySelector('p')?.textContent || '').trim();
    const priceText = (menuItem.querySelector('.price')?.textContent || '').trim();
    const imgSrc = menuItem.querySelector('img')?.getAttribute('src') || '';

    try {
      localStorage.setItem('pending_add', JSON.stringify({ 
        id, name, priceText, image: imgSrc 
      }));
    } catch {}

    window.location.href = 'dessertdetail.html?t=' + Date.now();
  }

  updateCartBadge();

  // ✅ กด + → เด้งไป detail ทันที (ไม่มีปุ่ม +/- บนการ์ด)
  if (menuList) {
    menuList.addEventListener('click', function (e) {
      const addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        const mi = addBtn.closest('.menu-item');
        if (!mi) return;
        goToDetailPageFor(mi);
        return;
      }
    });
  }

  // ✅ ค้นหา
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      const q = (e.target.value || '').trim().toLowerCase();
      document.querySelectorAll('.menu-item').forEach(mi => {
        const name = mi.querySelector('p')?.textContent.trim().toLowerCase() || '';
        mi.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
    });
  }

  // ✅ refresh เมื่อกลับจาก detail
  window.addEventListener('pageshow', function () {
    try {
      localStorage.removeItem('pending_add');
      updateCartBadge();
      console.log('[Dessert] cart badge refreshed');
    } catch (e) {
      console.error('[Dessert] pageshow error', e);
    }
  });
})();