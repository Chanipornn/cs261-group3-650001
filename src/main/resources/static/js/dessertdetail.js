/* eslint-disable */
// @ts-nocheck
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    const elTitle    = document.getElementById('item-title');
    const elImg      = document.getElementById('food-photo');
    const elMainQty  = document.getElementById('mainQty');
    const totalPrice = document.getElementById('totalPrice');
    const btnMinus   = document.getElementById('mainMinus');
    const btnPlus    = document.getElementById('mainPlus');
    const sizeWrap   = document.getElementById('sizeWrap');
    const addonsWrap = document.getElementById('addonsWrap');

    if (!elTitle || !elImg || !elMainQty || !totalPrice || !btnMinus || !btnPlus || !sizeWrap || !addonsWrap) {
      console.warn('[Detail] Missing DOM nodes');
      return;
    }

    const STORAGE_KEY = 'cart';
    let currentMenu = null;
    let mainQty = 1;
    let modifiers = [];
    const addonQty = {};

    const toTH = n => Number(n||0).toLocaleString('th-TH');

    function getMenuId() {
      let urlId = null;
      try { urlId = new URLSearchParams(window.location.search).get('id'); } catch {}
      let p = null;
      try { p = JSON.parse(localStorage.getItem('pending_add') || 'null'); } catch {}
      return urlId || (p ? p.id : null);
    }

    async function loadMenuFromAPI(id) {
      try {
        const res = await fetch(`http://localhost:8081/api/menu/${id}`);
        if (!res.ok) throw new Error('โหลดเมนูล้มเหลว');
        return await res.json();
      } catch (e) {
        console.error('[Detail] Fetch error:', e);
        return null;
      }
    }

    async function loadModifiersFromAPI(id) {
      try {
        const res = await fetch(`http://localhost:8081/api/menu/${id}/modifiers`);
        if (!res.ok) throw new Error('โหลด modifiers ล้มเหลว');
        return await res.json();
      } catch (e) {
        console.error('[Detail] Fetch modifiers error:', e);
        return [];
      }
    }

    function renderModifiers(mods) {
      const groups = {};
      mods.forEach(m => {
        if (!groups[m.groupId]) groups[m.groupId] = [];
        groups[m.groupId].push(m);
      });

      sizeWrap.innerHTML = '';
      addonsWrap.innerHTML = '';

      Object.values(groups).forEach(group => {
        const radioGroup = group.filter(m => !m.isAdditional); 
        const addOnGroup = group.filter(m => m.isAdditional);  

        // Radio
        if (radioGroup.length > 0) {
          radioGroup.forEach((m, i) => {
            const row = document.createElement('label');
            row.className = 'line radio-line';
            row.innerHTML = `
              <div class="left">
                <input type="radio" name="group-${m.groupId}" value="${m.id}" ${i===0?'checked':''}>
                <span>${m.name}${m.basePrice>0?` (+${m.basePrice} บาท)`:''}</span>
              </div>
            `;
            sizeWrap.appendChild(row);
          });
        }

        // Addon (counter)
        if (addOnGroup.length > 0) {
          addOnGroup.forEach(m => {
            addonQty[m.id] = 0;
            const row = document.createElement('div');
            row.className = 'line';
            row.innerHTML = `
              <div class="left"><span class="label">${m.name}</span></div>
              <div class="right row-ctrl">
                <span class="price">+${m.basePrice} บาท</span>
                <div class="qty">
                  <button type="button" data-ad="${m.id}" data-d="-1">−</button>
                  <input id="mod-${m.id}" value="0" readonly>
                  <button type="button" data-ad="${m.id}" data-d="1">+</button>
                </div>
              </div>
            `;
            addonsWrap.appendChild(row);
          });
        }
      });

      // Listener
      sizeWrap.addEventListener('change', recalc);

      // Listener
      addonsWrap.addEventListener('click', e => {
        const btn = e.target.closest('button[data-ad]');
        if (!btn) return;
        const id = parseInt(btn.dataset.ad);
        const d  = parseInt(btn.dataset.d);
        const input = document.getElementById(`mod-${id}`);
        const next = Math.max(0, Math.min(5, (addonQty[id]||0) + d));
        addonQty[id] = next;
        if(input) input.value = next;
        recalc();
      });
    }

    function calcPerDish() {
      let total = currentMenu.base || 0;

      // Radio
      const selectedRadio = sizeWrap.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        const mod = modifiers.find(m => m.id == selectedRadio.value);
        if (mod) total += Number(mod.basePrice || 0);
      }

      // Addons
      Object.keys(addonQty).forEach(id => {
        const m = modifiers.find(x => x.id == id);
        if (m) total += (addonQty[id]||0) * Number(m.basePrice||0);
      });

      return total;
    }

    function recalc() {
      const perDish = calcPerDish();
      const total = perDish * mainQty;
      elMainQty.textContent = String(mainQty);
      totalPrice.textContent = '฿' + toTH(total);
      return { perDish, total };
    }

    const id = getMenuId();
    const menuData = await loadMenuFromAPI(id);
    if (!menuData) { alert('โหลดเมนูไม่สำเร็จ'); return; }
    currentMenu = { id: Number(menuData.id), name: menuData.name, img: menuData.image, base: Number(menuData.price||0) };
    modifiers = await loadModifiersFromAPI(id);

    elTitle.textContent = currentMenu.name;
    elImg.src = currentMenu.img || '../img/placeholder.webp';
    elImg.alt = currentMenu.name;

    renderModifiers(modifiers);
    recalc();

    btnMinus.addEventListener('click', () => { if (mainQty>1){ mainQty--; recalc(); } });
    btnPlus.addEventListener('click', () => { if (mainQty<99){ mainQty++; recalc(); } });

    window.addToCart = function () {
      const noteEl = document.getElementById('note');
      const note = noteEl ? noteEl.value.trim() : '';
      const perDish = calcPerDish();

      const addons = Object.keys(addonQty)
        .filter(id => addonQty[id]>0)
        .map(id => {
          const m = modifiers.find(x => x.id == id);
          return { name: m.name, qty: addonQty[id], price: Number(m.basePrice || 0) };
        });

      const selectedRadios = sizeWrap.querySelectorAll('input[type="radio"]:checked');
      selectedRadios.forEach(radio => {
        const m = modifiers.find(x => x.id == radio.value);
        if (m) {
          addons.push({ name: m.name, qty: 1, price: Number(m.basePrice || 0) });
        }
      });

      let cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { cart = []; }

      const addonKey = addons.map(a => `${a.name}x${a.qty}`).join('|');
      const idx = cart.findIndex(it =>
        Number(it.menuId) === currentMenu.id &&
        (it.addons||[]).map(a => `${a.name}x${a.qty}`).join('|') === addonKey
      );

      if (idx > -1) {
        cart[idx].qty += mainQty;
        if (note) cart[idx].note = note;
        cart[idx].price = perDish;
      } else {
        cart.push({ menuId: currentMenu.id, name: currentMenu.name, qty: mainQty, price: perDish, image: elImg.src, addons, note });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      try { localStorage.setItem('pending_add', JSON.stringify({ id: currentMenu.id, qty: mainQty, amount: mainQty })); } 
	  catch {}
      window.location.href = 'dessert.html';
    };

    document.querySelector('.back').addEventListener('click', () => { window.history.back(); });
  }
})();
