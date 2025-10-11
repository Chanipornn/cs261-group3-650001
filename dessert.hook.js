/* eslint-disable */
// @ts-nocheck
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init () {
    const STORAGE_KEY = 'simple_cart_v1';
    const menuList   = document.querySelector('.menu-list');
    const cartBadge  = document.querySelector('.cart-badge');

    if (!menuList) {
      console.warn('[DessertHook] .menu-list not found');
      return;
    }

    // ---------- Helpers ----------
    function loadCart() {
      try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
        for (const k of Object.keys(data)) data[k] = Math.max(0, Number(data[k] || 0));
        return data;
      } catch { return {}; }
    }
    function saveCart(obj) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch {}
    }
    const cart = loadCart();

    function updateCartBadge() {
      if (!cartBadge) return;
      const total = Object.values(cart).reduce((s, v) => s + Number(v || 0), 0);
      cartBadge.style.display = total > 0 ? 'inline-block' : 'none';
      if (total > 0) cartBadge.textContent = String(total);
    }

    function createQtyControl(count) {
      const w = document.createElement('div');
      w.className = 'qty-control';
      const minus = Object.assign(document.createElement('button'), { type:'button', className:'minus', textContent:'−', 'aria-label':'ลดจำนวน' });
      const span  = Object.assign(document.createElement('span'), { className:'count', textContent:String(count) });
      const plus  = Object.assign(document.createElement('button'), { type:'button', className:'plus', textContent:'+', 'aria-label':'เพิ่มจำนวน' });
      w.append(minus, span, plus);
      return w;
    }

    function updateItemUI(itemEl, key) {
      const box = itemEl.querySelector('.image-box') || itemEl;
      if (!box) return;
      const addBtn = box.querySelector('.add-btn');
      const qtyCtl = box.querySelector('.qty-control');
      const count = Number(cart[key] || 0);

      if (count > 0) {
        if (!qtyCtl) {
          const qc = createQtyControl(count);
          if (addBtn) addBtn.remove();
          box.appendChild(qc);
        } else {
          const c = qtyCtl.querySelector('.count');
          if (c) c.textContent = String(count);
        }
      } else {
        if (!addBtn) {
          const btn = document.createElement('div');
          btn.className = 'add-btn';
          btn.dataset.action = 'add';
          btn.textContent = '+';
          btn.setAttribute('role', 'button');
          btn.setAttribute('aria-label', 'เพิ่มลงตะกร้า');
          if (qtyCtl) qtyCtl.remove();
          box.appendChild(btn);
        } else if (qtyCtl) {
          qtyCtl.remove();
        }
      }
    }

    // ---------- Normalize + absolute URL ----------
    function normalizeImg(path){
      if (!path) return '';
      const s = String(path).trim().replace(/\\/g,'/');
      if (/^data:/.test(s)) return s;
      if (/^(https?:)?\/\//.test(s) || s.startsWith('/')) {
        try { return new URL(s, window.location.href).href; } catch { return s; }
      }
      const encoded = s.split('/').map(seg => /%/.test(seg) ? seg : encodeURIComponent(seg)).join('/');
      try { return new URL(encoded, window.location.href).href; } catch { return encoded; }
    }

    // ---------- ไปหน้า detail ----------
    function goToDessertDetail(menuItem) {
      if (!menuItem) return;
      // กันเคส attribute มีช่องว่าง/ใช้ dataset แล้วว่าง
      const idAttr = (menuItem.getAttribute('data-id') || '').trim();
      const idData = (menuItem.dataset ? menuItem.dataset.id : '') || '';
      const idStr  = String(idAttr || idData).trim();
      if (!idStr) {
        console.warn('[DessertHook] no data-id on card', menuItem);
        alert('ไม่พบ data-id ของรายการนี้');
        return;
      }

      const name      = (menuItem.querySelector('p')?.textContent || '').trim();
      const priceText = (menuItem.querySelector('.price')?.textContent || '').trim();
      const imgRaw    = menuItem.querySelector('img')?.getAttribute('src') || '';
      const imageAbs  = normalizeImg(imgRaw);

      try { localStorage.removeItem('pending_add'); } catch {}
      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: idStr, name, priceText, image: imageAbs
        }));
      } catch (e) {
        console.warn('[DessertHook] set pending_add failed:', e);
      }

      const url = 'dessertdetail.html?id=' + encodeURIComponent(idStr) + '&t=' + Date.now();
      console.log('[DessertHook] goToDessertDetail →', url);
      // ใช้ assign ให้แน่ใจว่าปรับ history ปกติ และกันบางกรณี href ไม่ยิง
      try { window.location.assign(url); }
      catch { window.location.href = url; }
    }

    // ---------- Init tiles ----------
    document.querySelectorAll('.menu-item').forEach(mi => {
      // ตั้งคลาส/แอททริบิวต์ให้พร้อมคลิก
      mi.style.cursor = 'pointer';

      const key = String((mi.getAttribute('data-id') || mi.dataset?.id || '').trim());
      if (!key) {
        console.warn('[DessertHook] menu-item missing data-id', mi);
        return;
      }

      if (!(key in cart)) cart[key] = 0;
      updateItemUI(mi, key);

      const img = mi.querySelector('img');
      if (img) {
        const fixed = normalizeImg(img.getAttribute('src') || '');
        if (fixed) img.setAttribute('src', fixed);
      }

      // แถม: bind สำรองตรงๆ ที่การ์ดเผื่อ delegation โดน block
      mi.addEventListener('click', function(ev){
        // ถ้ากดบนปุ่ม add หรือ qty-control ให้ไปจัดการใน delegation แทน
        if (ev.target.closest('.add-btn') || ev.target.closest('.qty-control')) return;
        goToDessertDetail(mi);
      });
    });
    updateCartBadge();

    // ---------- Event Delegation (หลัก) ----------
    menuList.addEventListener('click', function (e) {
      const onAddBtn  = !!e.target.closest('.add-btn');
      const onQtyCtrl = !!e.target.closest('.qty-control');
      const card = e.target.closest('.menu-item');

      // 1) คลิกการ์ด (ที่ไม่ใช่ Add/qty-control) → ไป detail
      if (card && !onAddBtn && !onQtyCtrl) {
        e.preventDefault();
        e.stopPropagation();
        goToDessertDetail(card);
        return;
      }

      // 2) ปุ่ม Add (+) → ไป detail
      const add = e.target.closest('[data-action="add"]');
      if (add) {
        e.preventDefault();
        e.stopPropagation();
        const mi = add.closest('.menu-item');
        goToDessertDetail(mi);
        return;
      }

      // 3) ปุ่ม + ใน qty-control → ไป detail
      const plus = e.target.closest('.qty-control .plus');
      if (plus) {
        e.preventDefault();
        e.stopPropagation();
        const mi = plus.closest('.menu-item');
        goToDessertDetail(mi);
        return;
      }

      // 4) ปุ่ม − ยังให้ลดจำนวนได้จาก list
      const minus = e.target.closest('.qty-control .minus');
      if (minus) {
        const mi  = minus.closest('.menu-item');
        // กันเคสมีช่องว่างในแอททริบิวต์
        const key = String((mi?.getAttribute('data-id') || mi?.dataset?.id || '').trim());
        if (!key) return;
        cart[key] = Math.max(0, (Number(cart[key]) || 0) - 1);
        updateItemUI(mi, key); saveCart(cart); updateCartBadge();
        return;
      }
    });

    // ---------- Search ----------
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

    // ---------- Refresh on back (บวกจำนวนเฉพาะกรณีมาจาก detail แล้วกดเพิ่มจริง) ----------
    window.addEventListener('pageshow', function () {
      const fresh = loadCart();
      Object.keys(cart).forEach(k => delete cart[k]);
      Object.assign(cart, fresh || {});

      try {
        const raw = localStorage.getItem('pending_add');
        if (raw) {
          const p = JSON.parse(raw);
          const key = String((p?.id || '').trim());
          const qtyRaw = Number(p?.qty ?? p?.amount);
          const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 0;

          if (key && qty > 0) {
            cart[key] = (Number(cart[key]) || 0) + qty;
            saveCart(cart);
          }
          localStorage.removeItem('pending_add');
        }
      } catch (e) {
        console.warn('[DessertHook] pending_add parse error', e);
        try { localStorage.removeItem('pending_add'); } catch {}
      }

      document.querySelectorAll('.menu-item').forEach(mi => {
        const id = String((mi.getAttribute('data-id') || mi.dataset?.id || '').trim());
        if (!id) return;
        updateItemUI(mi, id);
      });
      updateCartBadge();
    });
  }
})();
