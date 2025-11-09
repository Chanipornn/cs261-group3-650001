/* eslint-disable */
// @ts-nocheck
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const elTitle    = document.getElementById('item-title');
    const elImg      = document.getElementById('food-photo');
    const elMainQty  = document.getElementById('mainQty');
    const totalPrice = document.getElementById('totalPrice');
    const btnMinus   = document.getElementById('mainMinus');
    const btnPlus    = document.getElementById('mainPlus');
    const sizeWrap   = document.getElementById('sizeWrap');
    const addonsWrap = document.getElementById('addonsWrap');

    if (!elTitle || !elImg || !elMainQty || !totalPrice || !btnMinus || !btnPlus || !sizeWrap || !addonsWrap) {
      console.warn('[Discount] Missing DOM nodes');
      return;
    }

    const STORAGE_KEY = 'cart';
    let currentMenu = null;
    let mainQty = 1;
    let modifiers = [];
    const addonQty = {};

    const toTH = n => Number(n||0).toLocaleString('th-TH');

    // ===== ข้อมูลเมนู =====
    currentMenu = {
      id: 1,
      name: 'สุกี้น้ำ',
      img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop',
      base: 50
    };
    modifiers = [
      { id: 1, groupId: 1, name: 'ปกติ', basePrice: 0, isAdditional: false },
      { id: 2, groupId: 1, name: 'พิเศษ', basePrice: 10, isAdditional: false },
      { id: 3, groupId: 2, name: 'ไข่เจียว', basePrice: 10, isAdditional: true },
      { id: 4, groupId: 2, name: 'ไข่ดาว', basePrice: 10, isAdditional: true }
    ];

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

        // Radio - แสดงราคาลดสำหรับตัวแรก
        if (radioGroup.length > 0) {
          radioGroup.forEach((m, i) => {
            const row = document.createElement('label');
            row.className = 'line radio-line';
            
            // ตัวแรกแสดงราคาลดเป็น 35 บาท
            if (i === 0) {
              const originalPrice = currentMenu.base || 0;
              const discountPrice = 35; // ราคาโปรโมชั่น
              row.innerHTML = `
                <div class="left">
                  <input type="radio" name="group-${m.groupId}" value="${m.id}" checked data-discount-price="${discountPrice}" data-original-price="${originalPrice}">
                  <span>${m.name}</span>
                </div>
                <div class="right">
                  <span class="price-old">ราคา ${originalPrice} บาท</span>
                  <span class="price-red">${discountPrice} บาท</span>
                </div>
              `;
            } else {
              row.innerHTML = `
                <div class="left">
                  <input type="radio" name="group-${m.groupId}" value="${m.id}">
                  <span>${m.name}${m.basePrice>0?` (+${m.basePrice} บาท)`:''}</span>
                </div>
                <div class="right">
                  <span class="price">+${m.basePrice} บาท</span>
                </div>
              `;
            }
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
      let total = 0;

      // Radio - ตรวจสอบว่าเป็นขนาดที่ลดราคาหรือไม่
      const selectedRadio = sizeWrap.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        const discountPrice = selectedRadio.dataset.discountPrice;
        if (discountPrice) {
          // ใช้ราคาลด
          total = Number(discountPrice);
        } else {
          // ไม่มีส่วนลด ใช้ราคาปกติ + modifier
          total = currentMenu.base || 0;
          const mod = modifiers.find(m => m.id == selectedRadio.value);
          if (mod) total += Number(mod.basePrice || 0);
        }
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

    elTitle.textContent = currentMenu.name;
    elImg.src = currentMenu.img || '../img/placeholder.webp';
    elImg.alt = currentMenu.name;

    renderModifiers(modifiers);
    recalc();

    btnMinus.addEventListener('click', () => { if (mainQty>1){ mainQty--; recalc(); } });
    btnPlus.addEventListener('click', () => { if (mainQty<99){ mainQty++; recalc(); } });

    // ===== Add to Cart =====
    window.addToCart = function () {
      const noteEl = document.getElementById('note');
      const note = noteEl ? noteEl.value.trim() : '';
      const perDish = calcPerDish();

      // Addons
      const addons = Object.keys(addonQty)
        .filter(id => addonQty[id]>0)
        .map(id => {
          const m = modifiers.find(x => x.id == id);
          return { name: m.name, qty: addonQty[id], price: Number(m.basePrice||0) };
        });

      // Radio
      const selectedRadio = sizeWrap.querySelector('input[type="radio"]:checked');
      let sizeExtra = 0;
      let sizeName = ''; 
      
      if(selectedRadio) {
        const m = modifiers.find(x => x.id == selectedRadio.value);
        sizeExtra = Number(m.basePrice||0);
        sizeName = m.name; 
      }

      let cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { cart = []; }

      const addonKey = addons.map(a => `${a.name}x${a.qty}`).join('|');
     
      const idx = cart.findIndex(it =>
        Number(it.menuId) === currentMenu.id &&
        (it.sizeName || '') === sizeName && 
        (it.addons||[]).map(a => `${a.name}x${a.qty}`).join('|') === addonKey
      );

      if (idx > -1) {
        cart[idx].qty += mainQty;
        if (note) cart[idx].note = note;
        cart[idx].price = perDish;
      } else {
        cart.push({
          menuId: currentMenu.id,
          name: currentMenu.name,
          qty: mainQty,
          sizeExtra: sizeExtra,
          sizeName: sizeName,
          price: perDish,
          image: elImg.src,
          addons: addons,
          note: note
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: currentMenu.id,
          qty: mainQty,
          amount: mainQty
        }));
      } catch {}

      window.location.href = 'menu.html';
    };
  }
})();