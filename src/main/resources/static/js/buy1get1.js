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
    const orderQty   = document.getElementById('orderQty');
    const totalQty   = document.getElementById('totalQty');
    const btnMinus   = document.getElementById('mainMinus');
    const btnPlus    = document.getElementById('mainPlus');
    const sizeWrap   = document.getElementById('sizeWrap');
    const addonsWrap = document.getElementById('addonsWrap');

    if (!elTitle || !elImg || !elMainQty || !totalPrice || !btnMinus || !btnPlus || !sizeWrap || !addonsWrap) {
      console.warn('[Buy1Get1] Missing DOM nodes');
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
      id: 3,
      name: 'ชาไทย',
      img: '../src-front/img-beverage/thai_tea.jpg',
      base: 40
    };
    modifiers = [
      { id: 1, groupId: 1, name: '25%', basePrice: 0, isAdditional: false },
      { id: 2, groupId: 1, name: '50%', basePrice: 0, isAdditional: false },
      { id: 3, groupId: 1, name: '75%', basePrice: 0, isAdditional: false },
      { id: 4, groupId: 1, name: '100%', basePrice: 0, isAdditional: false },
      { id: 5, groupId: 1, name: '125%', basePrice: 0, isAdditional: false }
    ];

    function renderModifiers(mods) {
      sizeWrap.innerHTML = '';
      addonsWrap.innerHTML = '';

      // สร้างกล่องความหวาน
      const box = document.createElement('div');
      box.className = 'line column';
      box.innerHTML = '<div class="label">เลือกระดับความหวาน</div>';

      // แสดงตัวเลือกความหวาน
      mods.forEach((m, i) => {
        const row = document.createElement('label');
        row.className = 'line radio-line';
        row.style.paddingTop = '6px';
        row.innerHTML = `
          <div class="left">
            <input type="radio" name="sweetness" value="${m.id}" ${i===1?'checked':''}>
            <span>หวาน ${m.name}</span>
          </div>
        `;
        box.appendChild(row);
      });

      sizeWrap.appendChild(box);

      // Listener
      sizeWrap.addEventListener('change', recalc);
    }

    function calcPerDish() {
      // ราคาเท่าเดิม ไม่มีค่าเพิ่มเติม
      return currentMenu.base || 0;
    }

    function recalc() {
      const perDish = calcPerDish();
      const total = perDish * mainQty;
      const actualQty = mainQty * 2; // 1 แถม 1 = ได้ 2 เท่า
      
      elMainQty.textContent = String(mainQty);
      totalPrice.textContent = '฿' + toTH(total);
      orderQty.textContent = mainQty + ' แก้ว';
      totalQty.textContent = actualQty + ' แก้ว';
      
      return { perDish, total, actualQty };
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
      const result = recalc();

      // เก็บความหวานที่เลือก
      const selectedRadio = sizeWrap.querySelector('input[type="radio"]:checked');
      let sweetnessText = '';
      if (selectedRadio) {
        const m = modifiers.find(x => x.id == selectedRadio.value);
        if (m) sweetnessText = 'ความหวาน ' + m.name;
      }

      let cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { cart = []; }

      const idx = cart.findIndex(it =>
        Number(it.menuId) === currentMenu.id &&
        (it.sweetness || '') === sweetnessText
      );

      if (idx > -1) {
        cart[idx].qty += mainQty;
        cart[idx].actualQty += result.actualQty;
        if (note) cart[idx].note = note;
      } else {
        cart.push({
          menuId: currentMenu.id,
          name: currentMenu.name,
          qty: mainQty,
          actualQty: result.actualQty,
          price: perDish,
          image: elImg.src,
          sweetness: sweetnessText,
          addons: sweetnessText ? [{ name: sweetnessText, qty: 1, price: 0 }] : [],
          note: note,
          promo: '1 แถม 1'
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: currentMenu.id,
          qty: mainQty,
          amount: result.actualQty
        }));
      } catch {}

      window.location.href = 'beverage.html';
    };
  }
})();