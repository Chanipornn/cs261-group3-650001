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
    // ===== DOM =====
    var elTitle    = document.getElementById('item-title');
    var elImg      = document.getElementById('food-photo');
    var addonsWrap = document.getElementById('addonsWrap');
    var elMainQty  = document.getElementById('mainQty');
    var totalPrice = document.getElementById('totalPrice');
    var btnMinus   = document.getElementById('mainMinus');
    var btnPlus    = document.getElementById('mainPlus');

    if (!elTitle || !elImg || !addonsWrap || !elMainQty || !totalPrice || !btnMinus || !btnPlus) {
      console.warn('[BeverageDetail] Missing DOM nodes');
      return;
    }

    // ===== Consts =====
    var STORAGE_CART = 'cart';   // array สำหรับ Summary
    var DEFAULT_PRICE = 20;
    var PLACEHOLDER_IMG = 'img/placeholder.webp';
    var SWEET_IDS = new Set(['6','7','8','9','10','11','12','13','14']); // น้ำชง

    // ===== Utils =====
    function toTH(n){ return Number(n||0).toLocaleString('th-TH'); }
    function readPending(){ try { return JSON.parse(localStorage.getItem('pending_add') || 'null'); } catch { return null; } }
    function parsePriceText(s){ var n = parseInt(String(s||'').replace(/\D+/g,''),10); return isNaN(n)?null:n; }
    function segEnc(p){ return p.split('/').map(seg => /%/.test(seg)?seg:encodeURIComponent(seg)).join('/'); }
    function resolveImg(raw){
      if (!raw) return PLACEHOLDER_IMG;
      var s = String(raw).trim().replace(/\\/g,'/');
      if (/^(https?:)?\/\//.test(s) || s.startsWith('/') || s.startsWith('data:')) return s;
      if (s.indexOf('/') !== -1) return segEnc(s);
      return segEnc('src/img-beverage/' + s);
    }
    function h(html){ var t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }

    // ===== Init state from pending =====
    var pending = readPending() || {};
    var idStr   = String(pending.id || '').trim();
    var state = {
      id: idStr || null,
      name: (pending.name || 'เครื่องดื่ม').trim(),
      base: parsePriceText(pending.priceText) ?? DEFAULT_PRICE,
      img:  resolveImg(pending.image || ''),
      qty: 1,
      sweetness: '50', // default
      note: ''
    };

    // Header
    elTitle.textContent = state.name;
    (function safeLoad(){
      var test = new Image();
      test.onload  = function(){ elImg.src = state.img; };
      test.onerror = function(){ elImg.src = PLACEHOLDER_IMG; };
      test.src = state.img;
    })();
    elImg.alt = state.name;

    // Addons (sweetness)
    function renderSweetness(){
      addonsWrap.innerHTML = '';
      if (!SWEET_IDS.has(state.id)) return;

      var box = document.createElement('div');
      box.className = 'line column';
      box.appendChild(Object.assign(document.createElement('div'), { className:'label', textContent:'เลือกระดับความหวาน' }));

      ['25','50','75','100','125'].forEach(pct => {
        box.appendChild(h(
          '<label class="line" style="padding-top:6px;">' +
            '<div class="left">' +
              '<input type="radio" name="sweetness" value="'+pct+'" '+(pct==='50'?'checked':'')+'>' +
              '<span>หวาน '+pct+'%</span>' +
            '</div>' +
            '<div class="right price"></div>' +
          '</label>'
        ));
      });

      addonsWrap.appendChild(box);
      addonsWrap.addEventListener('change', function(e){
        if (e.target && e.target.name === 'sweetness') {
          state.sweetness = e.target.value;
          recalc();
        }
      });
    }

    function unitPrice(){ return Number(state.base || 0); }
    function recalc(){
      elMainQty.textContent = String(state.qty);
      totalPrice.textContent = '฿' + toTH(unitPrice() * state.qty);
    }

    btnMinus.addEventListener('click', function(){ if (state.qty>1){ state.qty--; recalc(); } });
    btnPlus .addEventListener('click', function(){ if (state.qty<99){ state.qty++; recalc(); } });

    renderSweetness();
    recalc();

    // ===== Add to cart =====
    window.addToCart = function () {
      var noteEl = document.getElementById('note');
      state.note = noteEl ? (noteEl.value || '').trim() : '';

      // cart array
      var cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_CART) || '[]'); } catch { cart = []; }

      var newItem = {
        id: Date.now(),
        name: state.name,
        qty: state.qty,
        price: unitPrice(),   // ราคาต่อหน่วย
        image: state.img,
        addons: [],
        note: state.note
      };
      if (SWEET_IDS.has(state.id)) {
        newItem.addons.push({ name: 'ความหวาน ' + state.sweetness + '%', qty: 1, price: 0 });
      }

      // รวมเมนูซ้ำ (ชื่อ + ความหวาน + note)
      var sweetTxt = SWEET_IDS.has(state.id) ? ('ความหวาน ' + state.sweetness + '%') : '';
      var exist = cart.find(function(it){
        var s = (it.addons || []).find(a => a.name && a.name.indexOf('ความหวาน ') === 0);
        var sTxt = s ? s.name : '';
        return it.name === newItem.name && (it.note||'') === (newItem.note||'') && sTxt === sweetTxt;
      });
      if (exist) exist.qty = (exist.qty || 0) + newItem.qty;
      else cart.push(newItem);

      localStorage.setItem(STORAGE_CART, JSON.stringify(cart));

      // แจ้งหน้า beverage ให้เพิ่มตัวเลขด้วย (แบบเดียวกับ Home/dessert)
      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: state.id, qty: state.qty, amount: state.qty
        }));
      } catch {}

      location.href = 'beverage.html';
    };
  }
})();