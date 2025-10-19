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

    // ===== Utils =====
    function toTH(n){ return Number(n||0).toLocaleString('th-TH'); }
    function readPending(){ try { return JSON.parse(localStorage.getItem('pending_add') || 'null'); } catch { return null; } }
    function parsePriceText(s){ var n = parseInt(String(s||'').replace(/\D+/g,''),10); return isNaN(n)?null:n; }

    // ✅ auto detect path image ทุกกรณี
    function resolveImg(raw){
      if (!raw) return PLACEHOLDER_IMG;
      let s = String(raw).trim().replace(/\\/g,'/');

      // URL หรือ data URI
      if (/^(https?:|file:|data:)/.test(s)) return s;

      // เริ่มด้วย / → ใช้ตรงๆ
      if (s.startsWith('/')) return s;

      // ถ้ามี src-front → ตัดออก
      if (s.startsWith('src-front/')) s = s.replace('src-front/', '');

      // ถ้าเริ่มด้วย img-beverage/
      if (s.startsWith('img-beverage/')) return '/src-front/' + s;

      // เผื่อกรณีอื่น ๆ
      return '/src-front/img-beverage/' + s;
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
      bottleSize: 'normal'
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

    // ===== Render ขนาดขวด (น้ำเปล่า/เป๊ปซี่) =====
    function renderBottleSize(){
      if (!sizeWrap) return;
      sizeWrap.innerHTML = '';

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

      // ✅ แสดงความหวานถ้าเป็นเครื่องดื่มชง (ชื่อเมนูมีคำเหล่านี้)
      var sweetKeywords = ['ชา', 'โกโก้', 'นม', 'กาแฟ', 'coffee', 'tea', 'milk', 'cocoa'];
      var nameLower = (state.name || '').toLowerCase();
      var shouldShowSweet = sweetKeywords.some(k => nameLower.includes(k));
      if (!shouldShowSweet) return;

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

    // ===== คำนวณราคา (รวมขนาดขวด) =====
    function unitPrice(){ 
      var price = Number(state.base || 0);
      if (state.bottleSize === 'large') {
        if (state.id === '1') price += 10;
        if (state.id === '2') price += 20;
      }
      return price;
    }

    function recalc(){
      elMainQty.textContent = String(state.qty);
      totalPrice.textContent = '฿' + toTH(unitPrice() * state.qty);
    }

    btnMinus.addEventListener('click', function(){ if (state.qty>1){ state.qty--; recalc(); } });
    btnPlus .addEventListener('click', function(){ if (state.qty<99){ state.qty++; recalc(); } });

    renderBottleSize();
    renderSweetness();
    recalc();

    // ===== Add to cart =====
    window.addToCart = function () {
      var noteEl = document.getElementById('note');
      state.note = noteEl ? (noteEl.value || '').trim() : '';

      var cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_CART) || '[]'); } catch { cart = []; }

      // ✅ ใช้ id จริงจาก DB (menuId)
      var newItem = {
        menuId: state.id, // <<==== ใช้ ID จากฐานข้อมูลจริง
        name: state.name,
        qty: state.qty,
        price: unitPrice(),
        sizeExtra: (state.bottleSize === 'large') 
                    ? (state.id === '1' ? 10 : state.id === '2' ? 20 : 0) 
                    : 0,
        image: state.img,
        addons: [],
        note: state.note
      };

      // Add-on: ขวดใหญ่
      if ((state.id === '1' || state.id === '2') && state.bottleSize === 'large') {
        var bottlePrice = (state.id === '1') ? 10 : 20;
        newItem.addons.push({ name: 'ขวดใหญ่', qty: 1, price: bottlePrice });
      }

      // Add-on: ความหวาน
      var sweetKeywords = ['ชา', 'โกโก้', 'นม', 'กาแฟ', 'coffee', 'tea', 'milk', 'cocoa'];
      var nameLower = (state.name || '').toLowerCase();
      var shouldShowSweet = sweetKeywords.some(k => nameLower.includes(k));
      if (shouldShowSweet) {
        newItem.addons.push({ name: 'ความหวาน ' + state.sweetness + '%', qty: 1, price: 0 });
      }

      // รวมเมนูซ้ำ
      var bottleTxt = (state.id === '1' || state.id === '2') && state.bottleSize === 'large' ? 'ขวดใหญ่' : '';
      var sweetTxt = shouldShowSweet ? ('ความหวาน ' + state.sweetness + '%') : '';
      
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

      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: state.id, qty: state.qty, amount: state.qty
        }));
      } catch {}

      location.href = 'beverage.html';
    };
  }
})();
