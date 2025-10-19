/* eslint-disable */
// @ts-nocheck
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // แปลชื่ออังกฤษ → ไทย (ใช้ nameMap จาก fetchMenu.js ถ้ามี)
  function translateName(name) {
    if (window.nameMap && window.nameMap[name]) return window.nameMap[name];
    const fallback = {
      rice_plain: "ข้าวสวย",
      kapow_moosub: "ผัดกะเพราหมูสับ",
      kapow_moodeng: "ผัดกะเพราหมูเด้ง",
      kapow_squid: "ผัดกะเพราปลาหมึก",
      kapow_moogrob: "ผัดกะเพราหมูกรอบ",
      kapow_gai: "ผัดกะเพราไก่",
      kapow_shrimp: "ผัดกะเพรากุ้ง"
    };
    return fallback[name] || name;
  }

  async function init() {
    // ===== DOM refs =====
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

    // ===== Utils =====
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

    // ===== State =====
    let currentMenu = null;       // {id, name, img, base}
    let mainQty = 1;              // จำนวนจาน
    let sizeExtra = 0;            // ราคาเพิ่มจากขนาด (พิเศษ = +10)
    const addonDefs = [           // แอดออนแบบเดิม (มีตัวเลข − 0 +)
      { id:'egg_fried',  label:'ไข่ดาว',  price:10 },
      { id:'egg_omelet', label:'ไข่เจียว', price:10 }
    ];
    const addonQty = {};          // เก็บจำนวนของแอดออนแต่ละตัว { id: qty }

    // ===== Renderers =====
    function renderSizes() {
      sizeWrap.innerHTML = '';
      const sizes = [
        { key: 'normal',  label: 'ปกติ',             price: 0  },
        { key: 'special', label: 'พิเศษ (+10 บาท)',  price: 10 }
      ];
      sizes.forEach((s, i) => {
        const row = document.createElement('label');
        row.className = 'line radio-line';
        row.innerHTML = `
          <div class="left">
            <input type="radio" name="size" value="${s.key}" ${i===0?'checked':''}>
            <span>${s.label}</span>
          </div>
          <div class="right price">${s.price>0?('+'+s.price+' บาท'):''}</div>
        `;
        sizeWrap.appendChild(row);
      });
    }

    function renderAddons() {
      addonsWrap.innerHTML = '';
      addonDefs.forEach(ad => {
        addonQty[ad.id] = addonQty[ad.id] || 0;
        const row = document.createElement('div');
        row.className = 'line';
        row.innerHTML = `
          <div class="left"><span class="label">${ad.label}</span></div>
          <div class="right row-ctrl">
            <span class="price">+${ad.price} บาท</span>
            <div class="qty">
              <button type="button" data-ad="${ad.id}" data-d="-1">−</button>
              <input id="${ad.id}" value="${addonQty[ad.id]}" readonly>
              <button type="button" data-ad="${ad.id}" data-d="1">+</button>
            </div>
          </div>
        `;
        addonsWrap.appendChild(row);
      });
    }

    function calcPerDish() {
      const addonsTotal = addonDefs.reduce((s, ad) => s + (addonQty[ad.id]||0) * ad.price, 0);
      return (currentMenu.base||0) + sizeExtra + addonsTotal;
    }

    function recalc() {
      const perDish = calcPerDish();
      const total = perDish * mainQty;
      elMainQty.textContent = String(mainQty);
      totalPrice.textContent = '฿' + toTH(total);
      return { perDish, total };
    }

    // ===== Init =====
    const id = getMenuId();
    const menuData = await loadMenuFromAPI(id);
    if (!menuData) { alert('โหลดเมนูไม่สำเร็จ'); return; }

    currentMenu = {
      id: Number(menuData.id),
      name: menuData.name,
      img:  menuData.image,
      base: Number(menuData.price||0)
    };

    const nameTH = translateName(currentMenu.name);
    elTitle.textContent = nameTH;
    elImg.src = currentMenu.img || 'img/placeholder.webp';
    elImg.alt = nameTH;

    renderSizes();
    renderAddons();
    recalc();

    // ===== Events =====
    // จำนวนจาน
    btnMinus.addEventListener('click', () => { if (mainQty>1){ mainQty--; recalc(); } });
    btnPlus .addEventListener('click', () => { if (mainQty<99){ mainQty++; recalc(); } });

    // เปลี่ยนขนาด (ปกติ/พิเศษ)
    sizeWrap.addEventListener('change', e => {
      if (e.target.name !== 'size') return;
      sizeExtra = (e.target.value === 'special') ? 10 : 0;
      recalc();
    });

    // เพิ่ม/ลดแอดออนแบบเดิม (มี − 0 +)
    addonsWrap.addEventListener('click', e => {
      const btn = e.target.closest('button[data-ad]');
      if (!btn) return;
      const id = btn.dataset.ad;
      const d  = parseInt(btn.dataset.d, 10) || 0;
      const input = document.getElementById(id);
      const next = Math.max(0, Math.min(5, (addonQty[id]||0) + d)); // จำกัด 0..5
      addonQty[id] = next;
      if (input) input.value = String(next);
      recalc();
    });

    // ===== Add to Cart =====
    window.addToCart = function () {
      const noteEl = document.getElementById('note');
      const note = noteEl ? noteEl.value.trim() : '';
      const { perDish } = recalc();

      // สร้างรายการแอดออน (เฉพาะตัวที่ qty>0)
      const addons = addonDefs
        .filter(ad => (addonQty[ad.id]||0) > 0)
        .map(ad => ({ name: ad.label, qty: addonQty[ad.id], price: ad.price }));

      // อ่าน/เขียน cart
      let cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { cart = []; }

      // รวมซ้ำด้วยคีย์: menuId + sizeExtra + รายการแอดออนแบบข้อความ (เพื่อให้เหมือนพฤติกรรมเดิม)
      const addonKey = addons.map(a => `${a.name}x${a.qty}`).join('|');
      const idx = cart.findIndex(it =>
        Number(it.menuId) === currentMenu.id &&
        Number(it.sizeExtra||0) === Number(sizeExtra||0) &&
        (it.addons||[]).map(a => `${a.name}x${a.qty}`).join('|') === addonKey
      );

      if (idx > -1) {
        cart[idx].qty += mainQty;
        if (note) cart[idx].note = note; // อัปเดตโน้ตล่าสุด
        cart[idx].price = perDish;       // ราคาต่อหน่วยล่าสุด
      } else {
        cart.push({
          menuId: currentMenu.id,          // ✅ id จริงจาก DB
          name: nameTH,
          qty: mainQty,
          sizeExtra: sizeExtra,
          price: perDish,                  // ราคาต่อหน่วย (base + size + addons)
          image: elImg.src,
          addons: addons,                  // [{name, qty, price}]
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

      window.location.href = 'index.html';
    };
  }
})();
