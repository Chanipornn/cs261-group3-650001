(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const menuList   = document.querySelector('.menu-list');
  const cartBadge  = document.querySelector('.cart-badge');

  // 1=น้ำเปล่า, 2=เป๊ปซี่ → กด +/− ได้ตรงหน้าเมนู
  const INSTANT_IDS = new Set(['1','2']);

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
    } catch { return {}; }
  }
  const cart = loadCart();

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  }

  function createQtyControl(count) {
    const w = document.createElement('div');
    w.className = 'qty-control';
    const minus = Object.assign(document.createElement('button'), {type:'button', className:'minus', textContent:'−'});
    const span  = Object.assign(document.createElement('span'),   {className:'count', textContent:String(count)});
    const plus  = Object.assign(document.createElement('button'), {type:'button', className:'plus',  textContent:'+'});
    w.append(minus, span, plus);
    return w;
  }

  function updateItemUI(itemEl, id) {
    const box = itemEl.querySelector('.image-box');
    const add = box.querySelector('.add-btn');
    const qty = box.querySelector('.qty-control');
    const count = Number(cart[id] || 0);

    if (count > 0) {
      if (!qty) {
        const qc = createQtyControl(count);
        if (add) add.remove();
        box.appendChild(qc);
      } else {
        const c = qty.querySelector('.count'); if (c) c.textContent = String(count);
      }
    } else {
      if (!add) {
        const btn = document.createElement('div');
        btn.className = 'add-btn';
        btn.dataset.action = 'add';
        btn.textContent = '+';
        if (qty) qty.remove();
        box.appendChild(btn);
      } else if (qty) qty.remove();
    }
  }

  function updateCartBadge() {
    if (!cartBadge) return;
    const total = Object.values(cart).reduce((s, v) => s + Number(v || 0), 0);
    cartBadge.style.display = total > 0 ? 'inline-block' : 'none';
    if (total > 0) cartBadge.textContent = String(total);
  }

  // ไปหน้า detail พร้อมเก็บ pending_add
  function goToDetailPageFor(menuItem) {
    const id        = String(menuItem.dataset.id || '');
    const name      = (menuItem.querySelector('p')?.textContent || '').trim();
    const priceText = (menuItem.querySelector('.price')?.textContent || '').trim();
    const imgSrc    = menuItem.querySelector('img')?.getAttribute('src') || '';

    try {
      localStorage.setItem('pending_add', JSON.stringify({ id, name, priceText, image: imgSrc }));
    } catch {}

    // กัน cache ด้วย t=
    window.location.href = 'beveragedetail.html?t=' + Date.now();
  }

  // Init tiles
  document.querySelectorAll('.menu-item').forEach(mi => {
    const id = String(mi.dataset.id || '');
    if (!id) return;
    if (!(id in cart)) cart[id] = 0;
    updateItemUI(mi, id);
  });
  updateCartBadge();

  // Click handlers
  if (menuList) {
    menuList.addEventListener('click', function (e) {
      // ปุ่ม + สีเขียว (add)
      const add = e.target.closest('[data-action="add"]');
      if (add) {
        const mi = add.closest('.menu-item');
        const id = String(mi?.dataset.id || '');
        if (!id) return;

        if (INSTANT_IDS.has(id)) {                 // น้ำเปล่า/เป๊ปซี่ → เพิ่มทันที
          cart[id] = (Number(cart[id]) || 0) + 1;
          updateItemUI(mi, id); saveCart(); updateCartBadge();
        } else {                                   // อื่นๆ → เข้าหน้า detail เสมอ
          goToDetailPageFor(mi);
        }
        return;
      }

      // ปุ่ม + ในตัวนับ
      const plus = e.target.closest('.qty-control .plus');
      if (plus) {
        const mi = plus.closest('.menu-item');
        const id = String(mi?.dataset.id || '');
        if (!id) return;

        if (INSTANT_IDS.has(id)) {                 // น้ำเปล่า/เป๊ปซี่ → เพิ่มทันที
          cart[id] = (Number(cart[id]) || 0) + 1;
          updateItemUI(mi, id); saveCart(); updateCartBadge();
        } else {                                   // เครื่องดื่มต้องเลือกความหวาน → เข้าดีเทลทุกครั้ง
          goToDetailPageFor(mi);
        }
        return;
      }

      // ปุ่ม − ในตัวนับ (ให้ลดได้ปกติทุกเมนู)
      const minus = e.target.closest('.qty-control .minus');
      if (minus) {
        const mi = minus.closest('.menu-item');
        const id = String(mi?.dataset.id || '');
        if (!id) return;
        cart[id] = Math.max(0, (Number(cart[id]) || 0) - 1);
        updateItemUI(mi, id); saveCart(); updateCartBadge();
        return;
      }
    });
  }

  // refresh เมื่อกลับจาก detail
  window.addEventListener('pageshow', function () {
    const fresh = loadCart();
    Object.keys(cart).forEach(k => delete cart[k]);
    Object.assign(cart, fresh || {});
    document.querySelectorAll('.menu-item').forEach(mi => updateItemUI(mi, String(mi.dataset.id || '')));
    updateCartBadge();
  });
})();