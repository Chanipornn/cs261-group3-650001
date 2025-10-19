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
    if (!elTitle || !elImg || !addonsWrap || !elMainQty || !totalPrice || !btnMinus || !btnPlus) return;

    // ===== Consts =====
    var CART_ARRAY_KEY = 'cart';
    var DEFAULT_BASE_PRICE = 39;
    var PLACEHOLDER_IMG = 'img/placeholder.webp';

    function toTH(n){ return Number(n || 0).toLocaleString('th-TH'); }

    // ===== Load pending & URL =====
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem('pending_add') || 'null'); } catch {}
    var urlId = null;
    try { urlId = new URLSearchParams(location.search).get('id'); } catch {}
    var idStr = String((pending && pending.id) || urlId || '').trim();

    var basePrice = DEFAULT_BASE_PRICE;
    if (pending?.priceText) {
      var n = parseInt(String(pending.priceText).replace(/\D+/g,''),10);
      if (!isNaN(n) && n > 0) basePrice = n;
    }

    // ===== Addon config =====
    function flavor(group){ 
      return {
        name: group, label:'เลือกรสชาติ',
        options:[
          {value:'chocolate',  label:'ช็อกโกแลต',     price:0, checked:true},
          {value:'thai_tea',   label:'ชาไทย',         price:0},
          {value:'strawberry', label:'สตรอว์เบอร์รี่', price:0},
          {value:'blueberry',  label:'บลูเบอร์รี่',   price:0}
        ]
      };
    }

    var CONFIG_BY_ID = {
      '1': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '2': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '3': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '4': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '5': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '9': { radios: [{
        name:'toast_flavor', label:'เลือกรสชาติ',
        options:[
          {value:'butter_sugar',      label:'เนยน้ำตาล',          price:0, checked:true},
          {value:'butter_milk',       label:'เนยนมข้นหวาน',       price:0},
          {value:'butter_milk_sugar', label:'เนยนมน้ำตาล',        price:5},
          {value:'double_choc',       label:'ดับเบิ้ลช็อกโกแลต',  price:5}
        ]}]},
      '10': { radios:[flavor('icecream_flavor')] },
      '11': { radios:[flavor('lava_flavor')] },
      '12': { radios:[flavor('softcake_flavor')] },
      '13': { checks:[{id:'add_egg', label:'เพิ่มไข่', price:10}] },
      '14': { radios:[{
        name:'patongko_topping', label:'เลือกหน้า',
        options:[
          {value:'none',            label:'ไม่ใส่',       price:0, checked:true},
          {value:'condensed_milk',  label:'นมข้นหวาน',   price:0},
          {value:'pandan_custard',  label:'สังขยา',      price:5}
        ]
      }]}
    };

    // ===== Map DB IDs → Addon Groups =====
    var ID_MAP = {
      // ของทอด (ชีสดิฟ)
      15:'1', 16:'2', 17:'3', 18:'4', 19:'5', 20:'5',

      // ของหวานรสชาติ (flavor)
      21:'9', 22:'10', 23:'11', 24:'12',

      // ของร้อน (เพิ่มไข่)
      25:'13',

      // ปาท่องโก๋ (เลือกหน้า)
      26:'14'
    };

    // 🔧 รองรับทั้ง string / number
    var numId = Number(idStr);
    var mapped = ID_MAP[numId] || ID_MAP[idStr] || idStr;

    console.log('[DEBUG dessertdetail] pending =', pending, 'urlId =', urlId, 'idStr =', idStr, 'mapped =', mapped);

    var cfg = CONFIG_BY_ID[mapped] || {};
    cfg.checks = Array.isArray(cfg.checks) ? cfg.checks : [];
    cfg.radios = Array.isArray(cfg.radios) ? cfg.radios : [];

    // ===== State =====
    var state = {
      id: idStr || null,
      name: (pending?.name || 'ของทานเล่น').trim(),
      base: basePrice,
      img: pending?.image || '',
      qtyMain: 1,
      checks: {},
      radios: {}
    };

    // ===== Title & Image =====
    elTitle.textContent = state.name;
    elImg.src = state.img || PLACEHOLDER_IMG;
    elImg.onerror = function(){ elImg.src = PLACEHOLDER_IMG; };
    elImg.alt = state.name || 'ของทานเล่น';

    // ===== Render Addons =====
    renderAddons(cfg);

    // ===== Quantity control =====
    btnMinus.addEventListener('click', function(){
      if (state.qtyMain>1){ state.qtyMain--; recalc(cfg); }
    });
    btnPlus.addEventListener('click', function(){
      if (state.qtyMain<99){ state.qtyMain++; recalc(cfg); }
    });
    recalc(cfg);

    // ===== Add to Cart =====
    window.addToCart = function(){
      var note = (document.getElementById('note')?.value || '').trim();
      var qtyMain = Number(state.qtyMain || 1);
      var img = elImg?.src || '';
      var name = elTitle?.textContent?.trim() || 'ของทานเล่น';

      var addons = [];
      (cfg.checks || []).forEach(c => {
        if (state.checks && state.checks[c.id])
          addons.push({ name: c.label, qty: 1, price: Number(c.price||0) });
      });
      (cfg.radios || []).forEach(group => {
        var chosenValue = state.radios ? state.radios[group.name] : null;
        var opt = (group.options || []).find(o => o.value === chosenValue);
        if (opt) addons.push({ name: group.label+': '+opt.label, qty: 1, price: Number(opt.price||0) });
      });

      var unitPrice = computeUnitPrice(cfg);

      var cartArr;
      try {
        var raw = localStorage.getItem(CART_ARRAY_KEY);
        cartArr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(cartArr)) cartArr = [];
      } catch { cartArr = []; }

      var existing = cartArr.find(it => it.name === name && (it.note||'') === (note||''));
      if (existing) {
        existing.qty += qtyMain;
        existing.addons = existing.addons || [];
        addons.forEach(a=>{
          var same = existing.addons.find(x=>x.name===a.name && x.price===a.price);
          if (same) same.qty += a.qty;
          else existing.addons.push(a);
        });
        existing.price = unitPrice;
      } else {
        cartArr.push({
          menuId: Number(state.id),
          name: name,
          qty: qtyMain,
          price: unitPrice,
          image: img,
          addons: addons,
          note: note
        });
      }

      try { localStorage.setItem(CART_ARRAY_KEY, JSON.stringify(cartArr)); } catch {}
      try { localStorage.setItem('pending_add', JSON.stringify({ id: state.id, qty: qtyMain })); } catch {}
      location.href = 'dessert.html';
    };

    // ===== Render Addons Function =====
    function renderAddons(cfg){
      addonsWrap.innerHTML = '';

      if ((!cfg.checks || cfg.checks.length === 0) && (!cfg.radios || cfg.radios.length === 0)) {
        addonsWrap.innerHTML = '<div class="no-addon">ไม่มีตัวเลือกเพิ่มเติม</div>';
        return;
      }

      (cfg.checks||[]).forEach(c=>{
        var row=document.createElement('label');
        row.className='line';
        row.innerHTML =
          '<div class="left"><input type="checkbox" data-check="'+c.id+'"><span class="label">'+c.label+'</span></div>'+
          '<div class="right price">'+(c.price>0?('+'+c.price+' บาท'):'ฟรี')+'</div>';
        addonsWrap.appendChild(row);
      });

      (cfg.radios||[]).forEach(rg=>{
        var box=document.createElement('div');
        box.className='line column';
        var title=document.createElement('div');
        title.className='label';
        title.textContent=rg.label||'เลือกตัวเลือก';
        box.appendChild(title);
        (rg.options||[]).forEach((opt,idx)=>{
          var row=document.createElement('label');
          row.className='line';
          row.style.paddingTop='6px';
          row.innerHTML =
            '<div class="left"><input type="radio" name="'+rg.name+'" value="'+opt.value+'" '+(opt.checked?'checked':'')+'><span>'+opt.label+'</span></div>'+
            '<div class="right price">'+(opt.price>0?('+'+opt.price+' บาท'):'')+'</div>';
          box.appendChild(row);
          if (idx===0 && typeof state.radios[rg.name]==='undefined') state.radios[rg.name]=(opt.checked?opt.value:(rg.options[0]?.value));
          if (opt.checked) state.radios[rg.name]=opt.value;
        });
        addonsWrap.appendChild(box);
      });

      addonsWrap.addEventListener('change', function(e){
        var t=e.target;
        if (t && t.hasAttribute('data-check')) {
          state.checks[t.getAttribute('data-check')] = !!t.checked; 
          recalc(cfg);
        }
        else if (t && t.type==='radio' && t.name) { 
          state.radios[t.name]=t.value; 
          recalc(cfg); 
        }
      });
    }

    function computeUnitPrice(cfg){
      var sum = Number(state.base||0);
      (cfg.checks||[]).forEach(c=>{ if(state.checks[c.id]) sum += Number(c.price||0); });
      (cfg.radios||[]).forEach(rg=>{
        var opt=(rg.options||[]).find(o=>o.value===state.radios[rg.name]);
        if (opt) sum += Number(opt.price||0);
      });
      return sum;
    }

    function recalc(cfg){
      var unit=computeUnitPrice(cfg);
      var total=unit*(state.qtyMain||1);
      elMainQty.textContent=String(state.qtyMain);
      totalPrice.textContent='฿'+toTH(total);
    }
  }
})();
