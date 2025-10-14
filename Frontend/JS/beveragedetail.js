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
    var sizeWrap   = document.getElementById('sizeWrap');
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
    var STORAGE_CART = 'cart';
    var DEFAULT_PRICE = 20;
    var PLACEHOLDER_IMG = 'img/placeholder.webp';
    var SWEET_IDS = new Set(['3','4','5','6','7','8','9','10','11','12','13','14']); // น้ำชง (ไม่รวมน้ำเปล่า/เป๊ปซี่)

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
      sweetness: '50',
      bottleSize: 'normal' // เพิ่ม: ขนาดขวด (normal/large)
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

    // ===== 🆕 Render ขนาดขวด (น้ำเปล่า/เป๊ปซี่) =====
    function renderBottleSize(){
      if (!sizeWrap) return;
      sizeWrap.innerHTML = '';
      
      // เฉพาะน้ำเปล่า (id=1) และเป๊ปซี่ (id=2)
      if (state.id !== '1' && state.id !== '2') return;

      var priceExtra = (state.id === '1') ? 10 : 20; // น้ำเปล่า +10, เป๊ปซี่ +20

      var box = document.createElement('div');
      box.className = 'line column';
      box.appendChild(Object.assign(document.createElement('div'), { 
        className:'label', 
        textContent:'เลือกขนาดขวด' 
      }));

      // ขวดปกติ
      box.appendChild(h(
        '<label class="line radio-line" style="padding-top:6px;">' +
          '<div class="left">' +
            '<input type="radio" name="bottleSize" value="normal" checked>' +
            '<span>ขวดปกติ</span>' +
          '</div>' +
          '<div class="right price"></div>' +
        '</label>'
      ));

      // ขวดใหญ่
      box.appendChild(h(
        '<label class="line radio-line" style="padding-top:6px;">' +
          '<div class="left">' +
            '<input type="radio" name="bottleSize" value="large">' +
            '<span>ขวดใหญ่</span>' +
          '</div>' +
          '<div class="right price">+' + priceExtra + ' บาท</div>' +
        '</label>'
      ));

      sizeWrap.appendChild(box);
      
      // Event listener
      sizeWrap.addEventListener('change', function(e){
        if (e.target && e.target.name === 'bottleSize') {
          state.bottleSize = e.target.value;
          recalc();
        }
      });
    }

    // ===== Render ความหวาน (เครื่องดื่มชง) =====
    function renderSweetness(){
      addonsWrap.innerHTML = '';
      if (!SWEET_IDS.has(state.id)) return;

      var box = document.createElement('div');
      box.className = 'line column';
      box.appendChild(Object.assign(document.createElement('div'), { className:'label', textContent:'เลือกระดับความหวาน' }));

      ['25','50','75','100','125'].forEach(pct => {
        box.appendChild(h(
          '<label class="line radio-line" style="padding-top:6px;">' +
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

    // ===== 🆕 คำนวณราคา (รวมขนาดขวด) =====
    function unitPrice(){ 
      var price = Number(state.base || 0);
      
      // เพิ่มราคาขวดใหญ่
      if (state.bottleSize === 'large') {
        if (state.id === '1') price += 10; // น้ำเปล่า
        if (state.id === '2') price += 20; // เป๊ปซี่
      }
      
      return price;
    }

    function recalc(){
      elMainQty.textContent = String(state.qty);
      totalPrice.textContent = '฿' + toTH(unitPrice() * state.qty);
    }

    btnMinus.addEventListener('click', function(){ if (state.qty>1){ state.qty--; recalc(); } });
    btnPlus .addEventListener('click', function(){ if (state.qty<99){ state.qty++; recalc(); } });

    renderBottleSize(); // 🆕 เรียกใหม่
    renderSweetness();
    recalc();

    // ===== 🆕 Add to cart (บันทึกขนาดขวด) =====
    window.addToCart = function () {
      var noteEl = document.getElementById('note');
      state.note = noteEl ? (noteEl.value || '').trim() : '';

      var cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_CART) || '[]'); } catch { cart = []; }

      var newItem = {
        id: Date.now(),
        name: state.name,
        qty: state.qty,
        price: unitPrice(),
        image: state.img,
        addons: [],
        note: state.note
      };

      // เพิ่ม Add-on ขนาดขวด
      if ((state.id === '1' || state.id === '2') && state.bottleSize === 'large') {
        var bottlePrice = (state.id === '1') ? 10 : 20;
        newItem.addons.push({ 
          name: 'ขวดใหญ่', 
          qty: 1, 
          price: bottlePrice 
        });
      }

      // เพิ่ม Add-on ความหวาน
      if (SWEET_IDS.has(state.id)) {
        newItem.addons.push({ 
          name: 'ความหวาน ' + state.sweetness + '%', 
          qty: 1, 
          price: 0 
        });
      }

      // รวมเมนูซ้ำ
      var bottleTxt = (state.id === '1' || state.id === '2') && state.bottleSize === 'large' ? 'ขวดใหญ่' : '';
      var sweetTxt = SWEET_IDS.has(state.id) ? ('ความหวาน ' + state.sweetness + '%') : '';
      
      var exist = cart.find(function(it){
        var hasBottle = (it.addons || []).some(a => a.name === 'ขวดใหญ่');
        var hasSame = hasBottle === (bottleTxt === 'ขวดใหญ่');
        
        var s = (it.addons || []).find(a => a.name && a.name.indexOf('ความหวาน ') === 0);
        var sTxt = s ? s.name : '';
        
        return it.name === newItem.name && 
               (it.note||'') === (newItem.note||'') && 
               sTxt === sweetTxt &&
               hasSame;
      });

      if (exist) exist.qty = (exist.qty || 0) + newItem.qty;
      else cart.push(newItem);

      localStorage.setItem(STORAGE_CART, JSON.stringify(cart));

      // แจ้งหน้า beverage
      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: state.id, qty: state.qty, amount: state.qty
        }));
      } catch {}

      location.href = 'beverage.html';
    };
  }
})();