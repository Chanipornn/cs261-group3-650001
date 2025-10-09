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
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
      catch { return {}; }
    }
    function saveCart(cart) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
    }
    const cart = loadCart();

    function updateCartBadge() {
      if (!cartBadge) return;
      const total = Object.values(cart).reduce((s, v) => s + (v||0), 0);
      cartBadge.style.display = total > 0 ? 'inline-block' : 'none';
      if (total > 0) cartBadge.textContent = String(total);
    }

    function createQtyControl(count) {
      const w = document.createElement('div');
      w.className = 'qty-control';
      const minus = Object.assign(document.createElement('button'), { type:'button', className:'minus', textContent:'−' });
      const span  = Object.assign(document.createElement('span'), { className:'count', textContent:String(count) });
      const plus  = Object.assign(document.createElement('button'), { type:'button', className:'plus', textContent:'+' });
      w.append(minus, span, plus);
      return w;
    }

    function updateItemUI(itemEl, key) {
      const box = itemEl.querySelector('.image-box') || itemEl;
      const addBtn = box.querySelector('.add-btn');
      const qtyCtl = box.querySelector('.qty-control');
      const count = cart[key] || 0;

      if (count > 0) {
        if (!qtyCtl) {
          const qc = createQtyControl(count);
          if (addBtn) addBtn.remove();
          box.appendChild(qc);
        } else {
          qtyCtl.querySelector('.count').textContent = String(count);
        }
      } else {
        if (!addBtn) {
          const btn = document.createElement('div');
          btn.className = 'add-btn';
          btn.dataset.action = 'add';
          btn.textContent = '+';
          if (qtyCtl) qtyCtl.remove();
          box.appendChild(btn);
        } else {
          if (qtyCtl) qtyCtl.remove();
        }
      }
    }

    // ---------- Normalize + ทำ absolute URL ----------
    function normalizeImg(path){
      if (!path) return '';
      const s = String(path).replace(/\\/g,'/'); // \ -> /
      if (/^(https?:)?\/\//.test(s) || s.startsWith('/')) {
        // ทำ absolute ถ้ายังเป็น // หรือ / เฉย ๆ
        try { return new URL(s, window.location.href).href; } catch { return s; }
      }
      const encoded = s.split('/').map(seg => /%/.test(seg) ? seg : encodeURIComponent(seg)).join('/');
      try { return new URL(encoded, window.location.href).href; } catch { return encoded; }
    }

    // ---------- Go to Detail ----------
    function goToDessertDetail(menuItem) {
      const idStr     = String(menuItem.getAttribute('data-id') || '').trim();
      const name      = (menuItem.querySelector('p')?.textContent || '').trim();
      const priceText = (menuItem.querySelector('.price')?.textContent || '').trim();
      const imgRaw    = menuItem.querySelector('img')?.getAttribute('src') || '';
      const imageAbs  = normalizeImg(imgRaw); // << absolute

      try { localStorage.removeItem('pending_add'); } catch {}
      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: idStr, name, priceText, image: imageAbs
        }));
      } catch (e) {
        console.warn('[DessertHook] set pending_add failed:', e);
      }

      window.location.href = 'dessertdetail.html?t=' + Date.now(); // กัน cache
    }

    // ---------- Init tiles ----------
    document.querySelectorAll('.menu-item').forEach(mi => {
      const key = mi.getAttribute('data-id'); // ใช้เลข 1..14 เป็น key ของ cart
      if (!(key in cart)) cart[key] = 0;
      updateItemUI(mi, key);

      // normalize ภาพบนหน้า list ให้ขึ้นชัวร์
      const img = mi.querySelector('img');
      if (img) {
        const fixed = normalizeImg(img.getAttribute('src') || '');
        if (fixed) img.setAttribute('src', fixed);
      }

      // ให้คลิกได้ทั้งกรอบ/รูป/ชื่อ
      const imgBox = mi.querySelector('.image-box');
      const nameEl = mi.querySelector('p');
      [mi, imgBox, img, nameEl].forEach(el => {
        if (!el) return;
        el.style.cursor = 'pointer';
        el.addEventListener('click', function (ev) {
          if (ev.target.closest('.add-btn') || ev.target.closest('.qty-control')) return;
          goToDessertDetail(mi);
        });
      });
    });
    updateCartBadge();

    // ---------- Click handlers ----------
    menuList.addEventListener('click', function (e) {
      const add = e.target.closest('[data-action="add"]');
      if (add) {
        const mi = add.closest('.menu-item');
        goToDessertDetail(mi);
        return;
      }

      const plus = e.target.closest('.qty-control .plus');
      if (plus) {
        const mi  = plus.closest('.menu-item');
        const key = mi.getAttribute('data-id');
        cart[key] = (cart[key] || 0) + 1;
        updateItemUI(mi, key); saveCart(cart); updateCartBadge();
        return;
      }

      const minus = e.target.closest('.qty-control .minus');
      if (minus) {
        const mi  = minus.closest('.menu-item');
        const key = mi.getAttribute('data-id');
        cart[key] = Math.max(0, (cart[key] || 0) - 1);
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

    // ---------- Refresh on back ----------
    window.addEventListener('pageshow', function () {
      const fresh = loadCart();
      Object.keys(cart).forEach(k => delete cart[k]);
      Object.assign(cart, fresh || {});
      document.querySelectorAll('.menu-item').forEach(mi => {
        updateItemUI(mi, mi.getAttribute('data-id'));
      });
      updateCartBadge();
    });
  }
})();