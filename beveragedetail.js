/* eslint-disable */
// @ts-nocheck
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

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
      console.warn('[BeverageDetail] Missing nodes'); return;
    }

    // ===== CONST =====
    var CART_ARRAY_KEY = 'cart';
    var PLACEHOLDER_IMG = 'img/placeholder.webp';
    var DEFAULT_PRICE = 20;

    // id กลุ่มหวาน (ทุกตัวที่ต้องเลือกความหวาน)
    var SWEET_IDS = new Set(['3','4','5','6','7','8','9','10','11','12','13','14']);
    // id พิเศษ
    var WATER_ID = '1';  // น้ำเปล่า
    var PEPSI_ID = '2';  // เป๊ปซี่

    // ===== helpers =====
    function toTH(n){ return Number(n||0).toLocaleString('th-TH'); }
    function parsePriceText(t){ var n=parseInt(String(t||'').replace(/\D+/g,''),10); return isNaN(n)?null:n; }
    function resolveImage(raw){
      if (!raw) return PLACEHOLDER_IMG;
      var s = String(raw).trim().replace(/\\/g,'/');
      if (/^(https?:)?\/\//.test(s) || s.startsWith('/') || s.startsWith('data:')) return s;
      if (s.indexOf('/') !== -1) return s.split('/').map(seg=>/%/.test(seg)?seg:encodeURIComponent(seg)).join('/');
      return 'src/img-beverage/' + encodeURIComponent(s);
    }
    function htmlel(html){ var t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }

    function readPending(){
      try { return JSON.parse(localStorage.getItem('pending_add') || 'null'); }
      catch { return null; }
    }

    // ===== read pending =====
    var pending = readPending() || {};
    var idStr   = String(pending.id || '').trim();
    var name    = (pending.name || 'เครื่องดื่ม').trim();
    var base    = parsePriceText(pending.priceText); if (base==null) base = DEFAULT_PRICE;
    var imgUrl  = resolveImage(pending.image || '');

    // ===== state =====
    var state = {
      id: idStr,
      name: name,
      base: base,
      img: imgUrl,
      qty: 1,
      note: '',
      // ตัวเลือก
      sweetness: '50',          // สำหรับกลุ่มหวาน
      waterSize: 'small',       // small / large(+10)
      pepsiType: 'normal'       // normal / sugarfree
    };

    // paint header
    elTitle.textContent = state.name;
    elImg.alt = state.name;
    (function safeLoad(){
      var test = new Image();
      test.onload = function(){ elImg.src = state.img; };
      test.onerror = function(){ elImg.src = PLACEHOLDER_IMG; };
      test.src = state.img;
    })();

    // ===== render addons =====
    function renderAddons(){
      addonsWrap.innerHTML = '';

      if (state.id === WATER_ID) {
        // น้ำเปล่า: เลือกขวดเล็ก/ใหญ่ (+10)
        var box = htmlel('<div class="line column"></div>');
        box.appendChild(htmlel('<div class="label">เลือกขนาด</div>'));
        box.appendChild(htmlel(
          '<label class="line" style="padding-top:6px;">' +
            '<div class="left"><input type="radio" name="water_size" value="small" checked><span>ขวดเล็ก</span></div>' +
            '<div class="right price"></div>' +
          '</label>'
        ));
        box.appendChild(htmlel(
          '<label class="line" style="padding-top:6px;">' +
            '<div class="left"><input type="radio" name="water_size" value="large"><span>ขวดใหญ่</span></div>' +
            '<div class="right price">+10 บาท</div>' +
          '</label>'
        ));
        addonsWrap.appendChild(box);
      } else if (state.id === PEPSI_ID) {
        // เป๊ปซี่: ปกติ / ไม่มีน้ำตาล
        var box2 = htmlel('<div class="line column"></div>');
        box2.appendChild(htmlel('<div class="label">เลือกประเภท</div>'));
        box2.appendChild(htmlel(
          '<label class="line" style="padding-top:6px;">' +
            '<div class="left"><input type="radio" name="pepsi_type" value="normal" checked><span>ปกติ</span></div>' +
            '<div class="right price"></div>' +
          '</label>'
        ));
        box2.appendChild(htmlel(
          '<label class="line" style="padding-top:6px;">' +
            '<div class="left"><input type="radio" name="pepsi_type" value="sugarfree"><span>ไม่มีน้ำตาล</span></div>' +
            '<div class="right price"></div>' +
          '</label>'
        ));
        addonsWrap.appendChild(box2);
      } else if (SWEET_IDS.has(state.id)) {
        // กลุ่มหวาน: 25..125%
        var box3 = htmlel('<div class="line column"></div>');
        box3.appendChild(htmlel('<div class="label">เลือกระดับความหวาน</div>'));
        ['25','50','75','100','125'].forEach(function(pct,i){
          box3.appendChild(htmlel(
            '<label class="line" style="padding-top:6px;">' +
              '<div class="left"><input type="radio" name="sweetness" value="'+pct+'" '+(pct==='50'?'checked':'')+'><span>หวาน '+pct+'%</span></div>' +
              '<div class="right price"></div>' +
            '</label>'
          ));
        });
        addonsWrap.appendChild(box3);
      }

      // listen changes
      addonsWrap.addEventListener('change', function(e){
        var t=e.target;
        if (t.name === 'sweetness') { state.sweetness = t.value; }
        if (t.name === 'water_size') { state.waterSize = t.value; }
        if (t.name === 'pepsi_type') { state.pepsiType = t.value; }
        recalc();
      });
    }

    // ===== price calc =====
    function unitPrice(){
      var p = Number(state.base || 0);
      if (state.id === WATER_ID && state.waterSize === 'large') p += 10;
      return p;
    }
    function recalc(){
      var total = unitPrice() * Number(state.qty || 1);
      elMainQty.textContent = String(state.qty);
      totalPrice.textContent = '฿' + toTH(total);
    }

    btnMinus.addEventListener('click', function(){ if (state.qty>1){ state.qty--; recalc(); } });
    btnPlus .addEventListener('click', function(){ if (state.qty<99){ state.qty++; recalc(); } });

    renderAddons();
    recalc();

    // ===== add to cart =====
    window.addToCart = function(){
      var noteEl = document.getElementById('note');
      state.note = noteEl ? (noteEl.value || '').trim() : '';

      var cart = [];
      try { cart = JSON.parse(localStorage.getItem(CART_ARRAY_KEY) || '[]'); }
      catch { cart = []; }

      // สร้างข้อความออปชันเพื่อใช้ merge
      var optLabels = [];
      if (state.id === WATER_ID) {
        optLabels.push('ขนาด: ' + (state.waterSize === 'large' ? 'ขวดใหญ่ (+10)' : 'ขวดเล็ก'));
      } else if (state.id === PEPSI_ID) {
        optLabels.push('ประเภท: ' + (state.pepsiType === 'sugarfree' ? 'ไม่มีน้ำตาล' : 'ปกติ'));
      } else if (SWEET_IDS.has(state.id)) {
        optLabels.push('ความหวาน ' + state.sweetness + '%');
      }

      var newItem = {
        id: Date.now(),
        name: state.name,
        qty: state.qty,
        price: unitPrice(),     // ราคาต่อหน่วย
        image: state.img,
        addons: optLabels.map(t => ({ name: t, qty: 1, price: 0 })),
        note: state.note
      };

      // รวมของซ้ำ: ชื่อเหมือน & ตัวเลือกเหมือน & note เหมือน
      var match = cart.find(function(it){
        if (it.name !== newItem.name) return false;
        if ((it.note||'') !== (newItem.note||'')) return false;
        var a1 = (it.addons||[]).map(a=>a.name).sort().join('|');
        var a2 = (newItem.addons||[]).map(a=>a.name).sort().join('|');
        return a1 === a2;
      });
      if (match) {
        match.qty = (match.qty || 0) + newItem.qty;
        match.price = newItem.price; // อัปเดตราคาต่อหน่วยล่าสุด
      } else {
        cart.push(newItem);
      }

      localStorage.setItem(CART_ARRAY_KEY, JSON.stringify(cart));
      // กลับไปหน้าเครื่องดื่ม
      window.location.href = 'beverage.html';
    };
  }
})();