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
    var elTitle    = document.getElementById('item-title');
    var elImg      = document.getElementById('food-photo');
    var addonsWrap = document.getElementById('addonsWrap');
    var elMainQty  = document.getElementById('mainQty');
    var totalPrice = document.getElementById('totalPrice');
    var btnMinus   = document.getElementById('mainMinus');
    var btnPlus    = document.getElementById('mainPlus');
    if (!elTitle || !elImg || !addonsWrap || !elMainQty || !totalPrice || !btnMinus || !btnPlus) return;

    var STORAGE_KEY = 'simple_cart_v1';
    var CART_ARRAY_KEY = 'cart';
    var DEFAULT_BASE_PRICE = 39;
    var DEFAULT_IMG_PLACEHOLDER = 'img/placeholder.webp';

    function toTH(n){ return Number(n).toLocaleString('th-TH'); }

    // pending / URL fallback
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

    // image resolvers
    function segEnc(p){ return p.split('/').map(seg => /%/.test(seg)?seg:encodeURIComponent(seg)).join('/'); }
    function candidates(raw){
      if (!raw) return [];
      var s = String(raw).trim();
      var list = [];
      try { list.push(new URL(s, window.location.href).href); } catch { list.push(s); }
      var fwd = s.replace(/\\/g,'/');
      try { list.push(new URL(fwd, window.location.href).href); } catch { list.push(fwd); }
      list.push(segEnc(fwd));
      var base = 'src/img-dessert/';
      if (!/^(https?:)?\/\//.test(fwd) && fwd.indexOf('/') === -1) list.push(segEnc(base + fwd));
      return Array.from(new Set(list));
    }
    function tryLoadImage(imgEl, raw, fallback){
      var list = candidates(raw);
      var idx = 0;
      function attempt(){
        if (idx >= list.length) { imgEl.src = fallback; return; }
        var url = list[idx++];
        var test = new Image();
        test.onload = function(){ imgEl.src = url; };
        test.onerror = attempt;
        test.src = url;
      }
      attempt();
    }

    // addons config
    var CONFIG_BY_ID = {
      '1': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '2': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '3': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '4': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '5': { checks: [{id:'cheese_dip', label:'ชีสดิป', price:10}] },
      '6': { }, '7': { }, '8': { },
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
    function flavor(group){ return {
      name: group, label:'เลือกรสชาติ',
      options:[
        {value:'chocolate',  label:'ช็อกโกแลต',     price:0, checked:true},
        {value:'thai_tea',   label:'ชาไทย',         price:0},
        {value:'strawberry', label:'สตรอว์เบอร์รี่', price:0},
        {value:'blueberry',  label:'บลูเบอร์รี่',   price:0}
      ]
    };}

    // state
    var state = {
      id: idStr || null,
      name: (pending?.name || 'ของทานเล่น').trim(),
      base: basePrice,
      img: pending?.image || '',
      qtyMain: 1,
      checks: {},
      radios: {}
    };

    // title & image
    elTitle.textContent = state.name;
    tryLoadImage(elImg, state.img, DEFAULT_IMG_PLACEHOLDER);
    elImg.alt = state.name || 'ของทานเล่น';

    // addons
    var cfg = CONFIG_BY_ID[idStr] || {};
    renderAddons(cfg);

    // qty
    btnMinus.addEventListener('click', function(){ if (state.qtyMain>1){ state.qtyMain--; elMainQty.textContent=String(state.qtyMain); recalc(cfg);} });
    btnPlus .addEventListener('click', function(){ if (state.qtyMain<99){ state.qtyMain++; elMainQty.textContent=String(state.qtyMain); recalc(cfg);} });
    recalc(cfg);

    // ADD TO CART
    window.addToCart = function(){
      const note = (document.getElementById('note')?.value || '').trim();
      const qtyMain = parseInt(document.getElementById('mainQty').textContent, 10) || 1;
      const img = document.getElementById('food-photo')?.src || '';
      const name = document.getElementById('item-title')?.textContent?.trim() || 'ของทานเล่น';

      const addons = [];
      (cfg.checks || []).forEach(c => {
        if (state.checks && state.checks[c.id]) addons.push({ name: c.label, qty: 1, price: c.price || 0 });
      });
      (cfg.radios || []).forEach(group => {
        const chosenValue = state.radios ? state.radios[group.name] : null;
        const opt = (group.options || []).find(o => o.value === chosenValue);
        if (opt) addons.push({ name: `${group.label}: ${opt.label}`, qty: 1, price: opt.price || 0 });
      });

      const unitPrice = (typeof computeUnitPrice === 'function') ? computeUnitPrice(cfg) : (state.base || 0);

      let cartArr;
      try {
        const raw = localStorage.getItem(CART_ARRAY_KEY);
        cartArr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(cartArr)) cartArr = [];
      } catch { cartArr = []; }

      const existing = cartArr.find(it => it.name === name);
      if (existing) {
        existing.qty = (existing.qty || 0) + qtyMain;
        if (note) {
          const notes = existing.note ? existing.note.split(', ').filter(Boolean) : [];
          if (!notes.includes(note)) notes.push(note);
          existing.note = notes.join(', ');
        }
        existing.addons = existing.addons || [];
        addons.forEach(newAd => {
          const same = existing.addons.find(a => a.name === newAd.name);
          if (same) same.qty += newAd.qty;
          else existing.addons.push(newAd);
        });
        existing.price = unitPrice;
      } else {
        cartArr.push({ id: Date.now(), name, qty: qtyMain, price: unitPrice, image: img, addons, note });
      }

      try { localStorage.setItem(CART_ARRAY_KEY, JSON.stringify(cartArr)); } catch {}

      // แจ้งหน้า list ให้บวก badge/จำนวน
      try {
        localStorage.setItem('pending_add', JSON.stringify({
          id: idStr || (pending?.id || urlId || ''),
          qty: qtyMain,
          amount: qtyMain
        }));
      } catch {}

      window.location.href = "dessert.html";
    };

    // renderers
    function renderAddons(cfg){
      addonsWrap.innerHTML='';
      (cfg.checks||[]).forEach(c=>{
        var row=document.createElement('label');
        row.className='line';
        row.innerHTML =
          '<div class="left"><input type="checkbox" data-check="'+c.id+'"><span class="label">'+c.label+'</span></div>'+
          '<div class="right price">'+(c.price>0?('+'+c.price+' บาท'):'ฟรี')+'</div>';
        addonsWrap.appendChild(row);
      });
      (cfg.radios||[]).forEach(rg=>{
        var box=document.createElement('div'); box.className='line column';
        var title=document.createElement('div'); title.className='label'; title.textContent=rg.label||'เลือกตัวเลือก'; box.appendChild(title);
        (rg.options||[]).forEach((opt,idx)=>{
          var row=document.createElement('label'); row.className='line'; row.style.paddingTop='6px';
          row.innerHTML =
            '<div class="left"><input type="radio" name="'+rg.name+'" value="'+opt.value+'" '+(opt.checked?'checked':'')+'><span>'+opt.label+'</span></div>'+
            '<div class="right price">'+(opt.price>0?('+'+opt.price+' บาท'):'')+'</div>';
          box.appendChild(row);
          if (idx===0 && typeof state.radios[rg.name]==='undefined') state.radios[rg.name] = (opt.checked?opt.value:(rg.options[0]?.value));
          if (opt.checked) state.radios[rg.name]=opt.value;
        });
        addonsWrap.appendChild(box);
      });
      addonsWrap.addEventListener('change', function(e){
        var t=e.target;
        if (t && t.hasAttribute('data-check')) { state.checks[t.getAttribute('data-check')] = !!t.checked; recalc(cfg); }
        else if (t && t.type==='radio' && t.name) { state.radios[t.name]=t.value; recalc(cfg); }
      });
    }
    function computeUnitPrice(cfg){
      var sum = state.base;
      (cfg.checks||[]).forEach(c=>{ if(state.checks[c.id]) sum += (c.price||0); });
      (cfg.radios||[]).forEach(rg=>{
        var opt=(rg.options||[]).find(o=>o.value===state.radios[rg.name]);
        if (opt) sum += (opt.price||0);
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
