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
      name: 'สุกี้น้ำหมู',
      img: '../src-front/img-oneDishMeal/sukinam moo.jpg',
      base: 50,
      discountPrice: 35 // ราคาโปรโมชั่น
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

        // Radio - แสดงราคาลดสำหรับทุกตัวเลือก
        if (radioGroup.length > 0) {
          radioGroup.forEach((m, i) => {
            const row = document.createElement('label');
            row.className = 'line radio-line';
            
            const originalPrice = currentMenu.base || 0;
            const discountBase = currentMenu.discountPrice || originalPrice;
            const finalPrice = discountBase + Number(m.basePrice || 0);
            
            if (i === 0) {
              // ตัวแรก: แสดงราคาเต็ม vs ราคาลด
              row.innerHTML = `
                <div class="left">
                  <input type="radio" name="group-${m.groupId}" value="${m.id}" checked>
                  <span>${m.name}</span>
                </div>
                <div class="right">
                  <span class="price-old">ราคา ${originalPrice} บาท</span>
                  <span class="price-red">${finalPrice} บาท</span>
                </div>
              `;
            } else {
              // ตัวอื่นๆ: แสดงราคาลด + ค่าเพิ่มเติม
              const displayOriginal = originalPrice + Number(m.basePrice || 0);
              row.innerHTML = `
                <div class="left">
                  <input type="radio" name="group-${m.groupId}" value="${m.id}">
                  <span>${m.name}</span>
                </div>
                <div class="right">
                  <span class="price-old">ราคา ${displayOriginal} บาท</span>
                  <span class="price-red">${finalPrice} บาท</span>
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
      // ใช้ราคาลดเป็นฐาน
      let total = currentMenu.discountPrice || currentMenu.base || 0;

      // Radio - บวกค่าเพิ่มเติมจาก modifier
      const selectedRadio = sizeWrap.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        const mod = modifiers.find(m => m.id == selectedRadio.value);
        if (mod) {
          total += Number(mod.basePrice || 0);
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
      
      // อัพเดท summary box
      updateSummary(perDish, total);
      
      return { perDish, total };
    }

    function updateSummary(perDish, total) {
      const summaryBox = document.getElementById('summaryBox');
      if (!summaryBox) return;
      
      const originalPerDish = currentMenu.base || 0;
      const selectedRadio = sizeWrap.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        const mod = modifiers.find(m => m.id == selectedRadio.value);
        if (mod) {
          const originalTotal = (originalPerDish + Number(mod.basePrice || 0)) * mainQty;
          const saved = originalTotal - total;
          
          document.getElementById('originalPrice').textContent = '฿' + toTH(originalTotal);
          document.getElementById('discountPrice').textContent = '฿' + toTH(total);
          document.getElementById('savedAmount').textContent = '฿' + toTH(saved);
        }
      }
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
          note: note,
          promo: 'ลดราคา'
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