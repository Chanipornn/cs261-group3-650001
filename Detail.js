/* eslint-disable */
// @ts-nocheck
(function () {
  'use strict';

  // ===== DOM Ready =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // ===== DOM refs =====
    var elTitle    = document.getElementById('item-title');
    var elImg      = document.getElementById('food-photo');
    var sizeWrap   = document.getElementById('sizeWrap');
    var addonsWrap = document.getElementById('addonsWrap');
    var elMainQty  = document.getElementById('mainQty');
    var totalPrice = document.getElementById('totalPrice');
    var btnMinus   = document.getElementById('mainMinus');
    var btnPlus    = document.getElementById('mainPlus');

    if (!elTitle || !elImg || !sizeWrap || !addonsWrap || !elMainQty || !totalPrice || !btnMinus || !btnPlus) {
      console.warn('[Detail] Missing DOM nodes');
      return;
    }

    // ===== Consts =====
    // ใช้ key เดียวกับ Summary.js
    var STORAGE_KEY = 'cart';
    var MENU_ID_FALLBACK = 'kapow_gai';

    var NORMAL_SPECIAL = [
      { key: 'normal',  label: 'ปกติ', price: 0 },
      { key: 'special', label: 'พิเศษ', price: 10 }
    ];

    // ส่วนใหญ่ → ไข่ดาว/ไข่เจียว (qty 0–5)
    var ADDON_EGG_FRY = [
      { id:'egg_omelet', label:'ไข่เจียว', price:10 },
      { id:'egg_fried',  label:'ไข่ดาว',  price:10 }
    ];
    // สปาเกตตี/สุกี้/ยำ/ข้าวต้ม → ไข่ลวก/ไข่ต้ม (qty 0–5)
    var ADDON_EGG_BOIL = [
      { id:'egg_soft', label:'ไข่ลวก', price:10 },
      { id:'egg_hard', label:'ไข่ต้ม', price:10 }
    ];

    // ===== Image helpers =====
    function getImgBase() {
      try {
        var b = (localStorage.getItem('img_base') || '').replace(/\\/g,'/');
        if (b && !/\/$/.test(b)) b += '/';
        return b;
      } catch(e){ return ''; }
    }
    function resolveImgSmart(raw) {
      var s = String(raw || '').trim().replace(/\\/g,'/'); // normalize slash
      if (!s) return '';
      if (/^(https?:)?\/\//.test(s) || /^data:/.test(s) || s.startsWith('/')) return s;
      if (s.indexOf('/') !== -1) {
        return s.split('/').map(encodeURIComponent).join('/');
      }
      var base = getImgBase() || 'src/img-oneDishMeal/';
      if (!base.endsWith('/')) base += '/';
      var joined = base + s;
      return joined.split('/').map(encodeURIComponent).join('/');
    }

    // ===== MENUS 1–50 (เต็ม) =====
    var MENUS = {
      // 1
      rice_plain:{id:'rice_plain',name:'ข้าวสวย',img:'kaosuay.png',base:10,sizes:NORMAL_SPECIAL},

      // 2..7 กะเพรา (ไข่ดาว/ไข่เจียว)
      kapow_moosub:{id:'kapow_moosub',name:'ผัดกะเพราหมูสับ',img:'padkrapaomoosap.avif',base:45,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kapow_moodeng:{id:'kapow_moodeng',name:'ผัดกะเพราหมูเด้ง',img:'moodeng.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kapow_squid:{id:'kapow_squid',name:'ผัดกะเพราปลาหมึก',img:'kapowpamuk.webp',base:70,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kapow_moogrob:{id:'kapow_moogrob',name:'ผัดกะเพราหมูกรอบ',img:'kapowmukob.webp',base:60,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kapow_gai:{id:'kapow_gai',name:'ผัดกะเพราไก่',img:'kapowgai.webp',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kapow_shrimp:{id:'kapow_shrimp',name:'ผัดกะเพรากุ้ง',img:'kapowkung.jpg',base:65,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 8..10 พริกแกง
      prikgaeng_pork:{id:'prikgaeng_pork',name:'ผัดพริกแกงหมู',img:'prikkang moo.jpg',base:45,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      prikgaeng_chicken:{id:'prikgaeng_chicken',name:'ผัดพริกแกงไก่',img:'prikkang gai.webp',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      prikgaeng_beef:{id:'prikgaeng_beef',name:'ผัดพริกแกงเนื้อ',img:'prikkang beef.webp',base:60,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 11..14 ผัดผัก
      kana_moogrob:{id:'kana_moogrob',name:'ผัดคะน้าหมูกรอบ',img:'kanamukob.jpg',base:60,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      khaenang_moogrob:{id:'khaenang_moogrob',name:'ผัดแขนงหมูกรอบ',img:'kanangmukob.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      morning_glory:{id:'morning_glory',name:'ผัดผักบุ้ง',img:'padpakbung.jpeg',base:45,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      mixed_veg:{id:'mixed_veg',name:'ผัดผักรวม',img:'padpakruam.jpg',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 15..17 ผงกะหรี่
      curry_squid:{id:'curry_squid',name:'ผัดผงกะหรี่ปลาหมึก',img:'pongkaree pamuk.jpg',base:70,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      curry_shrimp:{id:'curry_shrimp',name:'ผัดผงกะหรี่กุ้ง',img:'pongkaree kung.jpg',base:65,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      curry_chicken:{id:'curry_chicken',name:'ผัดผงกะหรี่ไก่',img:'pongkaree gai.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 18..22 กระเทียม/น้ำมันหอย/พริกหยวก
      garlic_pork:{id:'garlic_pork',name:'หมูกระเทียม',img:'moo kateam.jpg',base:45,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      garlic_chicken:{id:'garlic_chicken',name:'ไก่กระเทียม',img:'gai kateam.jpg',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      oyster_pork:{id:'oyster_pork',name:'หมูผัดน้ำมันหอย',img:'moo nammanhoi.jpg',base:45,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      chilipork_caps:{id:'chilipork_caps',name:'หมูผัดพริกหยวก',img:'moo pikyuak.jpg',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      chilichicken_caps:{id:'chilichicken_caps',name:'ไก่ผัดพริกหยวก',img:'gai prikyuak.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 23..24 เปรี้ยวหวาน
      sweet_sour_pork:{id:'sweet_sour_pork',name:'ผัดเปรี้ยวหวานหมู',img:'preawwanmoo.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      sweet_sour_fish:{id:'sweet_sour_fish',name:'ผัดเปรี้ยวหวานปลา',img:'preawwanfish.webp',base:70,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 25..28 ขี้เมา
      kee_mao_pork:{id:'kee_mao_pork',name:'ผัดขี้เมาหมู',img:'keemao moo.jpg',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kee_mao_chicken:{id:'kee_mao_chicken',name:'ผัดขี้เมาไก่',img:'keemao gai.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kee_mao_beef:{id:'kee_mao_beef',name:'ผัดขี้เมาเนื้อ',img:'keemao beef.jpg',base:65,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      kee_mao_sea:{id:'kee_mao_sea',name:'ผัดขี้เมาทะเล',img:'keemao tale.png',base:75,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 29 สปาเกตตี (ไข่ลวก/ไข่ต้ม)
      spaghetti_kee_mao:{id:'spaghetti_kee_mao',name:'สปาเกตตีผัดขี้เมา',img:'spa keemao.jpg',base:65,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},

      // 30..33 กลุ่มไข่เจียว (ไม่มีแอดออน)
      kai_omelet_rice:{id:'kai_omelet_rice',name:'ข้าวไข่เจียว',img:'kaokaijeaw.jpg',base:35,sizes:NORMAL_SPECIAL},
      omelet_shrimp:{id:'omelet_shrimp',name:'ไข่เจียวกุ้ง',img:'kaijeaw kung.jpg',base:50,sizes:NORMAL_SPECIAL},
      omelet_pork:{id:'omelet_pork',name:'ไข่เจียวหมูสับ',img:'kaijeaw moosub.jpg',base:45,sizes:NORMAL_SPECIAL},
      omelet_crab:{id:'omelet_crab',name:'ไข่เจียวปู',img:'kaijeaw poo.jpg',base:80,sizes:NORMAL_SPECIAL},

      // 34..37 ข้าวผัด
      fried_rice_pork:{id:'fried_rice_pork',name:'ข้าวผัดหมู',img:'kaopad moo.jpg',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      fried_rice_shrimp:{id:'fried_rice_shrimp',name:'ข้าวผัดกุ้ง',img:'kaopadkung.png',base:65,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      fried_rice_sea:{id:'fried_rice_sea',name:'ข้าวผัดทะเล',img:'kaopad tale.jpg',base:70,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      fried_rice_canned_fish:{id:'fried_rice_canned_fish',name:'ข้าวผัดปลากระป๋อง',img:'kaopad papong.webp',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 38..40 เส้น/ราดหน้า/ผัดไทย
      pad_see_ew_pork:{id:'pad_see_ew_pork',name:'ผัดซีอิ๊วหมู',img:'padsiew moo.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      rad_na_pork:{id:'rad_na_pork',name:'ราดหน้าหมู',img:'radna moo.webp',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},
      pad_thai_shrimp:{id:'pad_thai_shrimp',name:'ผัดไทยกุ้งสด',img:'padthai kungsod.webp',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_FRY},

      // 41 ต้มจืด (ไม่มีแอดออน)
      tom_jued_pork:{id:'tom_jued_pork',name:'ต้มจืดหมู',img:'tomjuad moo.webp',base:50,sizes:NORMAL_SPECIAL},

      // 42..44 สุกี้ (ไข่ลวก/ไข่ต้ม)
      suki_water_pork:{id:'suki_water_pork',name:'สุกี้น้ำหมู',img:'sukinam moo.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},
      suki_water_sea:{id:'suki_water_sea',name:'สุกี้น้ำทะเล',img:'sukinam tale.jpg',base:70,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},
      suki_dry_pork:{id:'suki_dry_pork',name:'สุกี้แห้งหมู',img:'suki hang moo.jpg',base:55,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},

      // 45..47 ยำ (ไข่ลวก/ไข่ต้ม)
      yum_mu_yo:{id:'yum_mu_yo',name:'ยำหมูยอ',img:'yum moo yor.jpg',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},
      yum_woonsen_sea:{id:'yum_woonsen_sea',name:'ยำวุ้นเส้นทะเล',img:'yum wonsen tale.jpg',base:70,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},
      yum_canned_fish:{id:'yum_canned_fish',name:'ยำปลากระป๋อง',img:'yum pakapong.jpg',base:50,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},

      // 48..50 ข้าวต้ม (ไข่ลวก/ไข่ต้ม)
      khao_tom_shrimp:{id:'khao_tom_shrimp',name:'ข้าวต้มกุ้ง',img:'kaotom kung.jpg',base:65,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},
      khao_tom_pork:{id:'khao_tom_pork',name:'ข้าวต้มหมูสับ',img:'kaotom moosab.jpg',base:45,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL},
      khao_tom_fish:{id:'khao_tom_fish',name:'ข้าวต้มปลา',img:'kaotom pla.jpg',base:60,sizes:NORMAL_SPECIAL,addons:ADDON_EGG_BOIL}
    };

    // ===== State =====
    var currentMenu = null;
    var mainQty = 1;
    var addonInputs = {}; // {addonId: <input>}

    // ===== Helpers =====
    function toTH(n){ return Number(n).toLocaleString('th-TH'); }

    function getMenuId() {
      var urlId = null;
      try { urlId = new URLSearchParams(window.location.search).get('id'); } catch(e){}
      var pending = null;
      try { pending = JSON.parse(localStorage.getItem('pending_add') || 'null'); } catch(e){}
      var id = urlId || (pending ? pending.id : null) || MENU_ID_FALLBACK;
      if (!MENUS[id]) { console.warn('[Detail] Unknown id:', id, '→ fallback to', MENU_ID_FALLBACK); id = MENU_ID_FALLBACK; }
      return id;
    }

    function applyPriceFromPending(menu){
      try{
        var p = JSON.parse(localStorage.getItem('pending_add') || 'null');
        if (p && p.priceText) {
          var num = parseInt(String(p.priceText).replace(/\D+/g, ''), 10);
          if (!isNaN(num) && num > 0) { menu.base = num; }
        }
      }catch(e){}
    }

    function renderSizes(menu){
      sizeWrap.innerHTML = '';
      var sizes = (menu.sizes && menu.sizes.length) ? menu.sizes : NORMAL_SPECIAL;
      for (var i=0;i<sizes.length;i++){
        var s = sizes[i];
        var row = document.createElement('label');
        row.className = 'line radio-line';
        row.innerHTML =
          '<div class="left">' +
            '<input type="radio" name="size" value="'+s.key+'" '+(i===0?'checked':'')+'>' +
            '<span>'+s.label+'</span>' +
          '</div>' +
          '<div class="right price">'+ (s.price>0?('+'+s.price+' บาท'):'') +'</div>';
        sizeWrap.appendChild(row);
      }
      var radios = sizeWrap.querySelectorAll('input[name="size"]');
      for (var r=0;r<radios.length;r++){ radios[r].addEventListener('change', recalc); }
    }

    function renderAddons(menu){
      addonsWrap.innerHTML = '';
      addonInputs = {};
      if (!menu.addons || !menu.addons.length) return;

      for (var i=0;i<menu.addons.length;i++){
        var ad = menu.addons[i];
        var row = document.createElement('div');
        row.className = 'line';
        row.innerHTML =
          '<div class="left"><span class="label">'+ad.label+'</span></div>' +
          '<div class="right row-ctrl">' +
            '<span class="price">+'+ad.price+' บาท</span>' +
            '<div class="qty">' +
              '<button type="button" data-ad="'+ad.id+'" data-d="-1">−</button>' +
              '<input id="'+ad.id+'" value="0" readonly>' +
              '<button type="button" data-ad="'+ad.id+'" data-d="1">+</button>' +
            '</div>' +
          '</div>';
        addonsWrap.appendChild(row);
        addonInputs[ad.id] = row.querySelector('#'+ad.id);
      }
    }

    addonsWrap.addEventListener('click', function(e){
      var btn = e.target;
      if (!btn.getAttribute || !btn.getAttribute('data-ad')) return;
      var id = btn.getAttribute('data-ad');
      var d  = parseInt(btn.getAttribute('data-d'),10);
      var el = addonInputs[id]; if (!el) return;
      var v = parseInt(el.value||'0',10) + d;
      if (v<0) v=0; if (v>5) v=5;
      el.value = String(v);
      recalc();
    });

    function addToCart() {
        // ดึงข้อมูลจากหน้า
        const title = document.getElementById("item-title").innerText;
        const note = document.getElementById("note").value || "-";
        const qty = parseInt(document.getElementById("mainQty").innerText);
        const total = document.getElementById("totalPrice").innerText;
      
        // สร้างอ็อบเจ็กต์สำหรับเก็บข้อมูล
        const order = {
          title: title,
          quantity: qty,
          note: note,
          total: total
        };
      }
      

    function getSizeExtra(menu){
      var radios = document.querySelectorAll('input[name="size"]');
      var key = 'normal';
      for (var i=0;i<radios.length;i++){
        if (radios[i].checked){ key = radios[i].value; break; }
      }
      var sizes = (menu.sizes && menu.sizes.length) ? menu.sizes : NORMAL_SPECIAL;
      for (var j=0;j<sizes.length;j++){
        if (sizes[j].key === key) return sizes[j].price || 0;
      }
      return 0;
    }

    function recalc(){
      var sizeExtra = getSizeExtra(currentMenu);
      var addonsTotal = 0;
      var list = currentMenu.addons || [];
      for (var i=0;i<list.length;i++){
        var ad = list[i];
        var el = addonInputs[ad.id];
        var qty = el ? parseInt(el.value||'0',10) : 0;
        addonsTotal += qty * (ad.price||0);
      }
      var perDish = (currentMenu.base||0) + sizeExtra + addonsTotal;
      var total = perDish * mainQty;
      elMainQty.textContent = String(mainQty);
      totalPrice.textContent = '฿' + toTH(total);
    }

    // ปุ่มจำนวนหลัก
    btnMinus.addEventListener('click', function(){ if (mainQty>1){ mainQty--; recalc(); } });
    btnPlus .addEventListener('click', function(){ if (mainQty<99){ mainQty++; recalc(); } });

    // ===== Init: pick menu + display =====
    var id = getMenuId();
    currentMenu = MENUS[id] || MENUS[MENU_ID_FALLBACK];

    // ถ้า Home ส่ง “XX บาท” มากับ pending_add → override base
    applyPriceFromPending(currentMenu);

    // ตั้งชื่อ/รูป
    elTitle.textContent = currentMenu.name;

    // ใช้รูปจาก Home ก่อน ถ้าไม่มีก็ใช้ใน MENUS
    var pendingForImg = null;
    try { pendingForImg = JSON.parse(localStorage.getItem('pending_add') || 'null'); } catch(e){}
    var imgCandidate = (pendingForImg && pendingForImg.image) ? pendingForImg.image : currentMenu.img;
    elImg.src = resolveImgSmart(imgCandidate);
    elImg.alt = currentMenu.name;

    // Render options
    renderSizes(currentMenu);
    renderAddons(currentMenu);
    recalc();

    // ====== ADD TO CART (รวมเมนูเดิม + รวมแอดออน) ======
    window.addToCart = function () {
      var noteEl = document.getElementById("note");
      var note = noteEl ? noteEl.value.trim() : "";
      var qty = mainQty;
      var imgSrc = elImg ? elImg.src : "";
      var name = currentMenu.name || "เมนู";

      // ขนาด + ส่วนเพิ่มราคา
      var size = 'normal';
      var sizeExtra = getSizeExtra(currentMenu);

      var r = document.querySelector('input[name="size"]:checked');
      if (r) size = r.value || 'normal';

      // แอดออน -> array {name, qty, price}
      var addons = [];
      (currentMenu.addons || []).forEach(function(ad){
        var input = addonInputs[ad.id];
        var q = input ? parseInt(input.value || '0', 10) : 0;
        if (q > 0) addons.push({ name: ad.label, qty: q, price: ad.price || 0 });
      });

      // ราคาต่อหน่วย
      var unit = (currentMenu.base || 0) + sizeExtra + addons.reduce(function(s,a){return s + (a.price||0)*(a.qty||0);}, 0);

      // โหลด cart (array)
      var cart = [];
      try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e){ cart = []; }

      // รวมรายการซ้ำ: ใช้ key จาก ชื่อ + ขนาด
      var idx = cart.findIndex(function(it){
        return (it.name === name) && (String(it.size||'normal') === String(size||'normal'));
      });

      if (idx > -1) {
        // รวมจำนวน
        cart[idx].qty = (cart[idx].qty || 0) + qty;
        // รวมโน้ต (สะสมข้อความ ไม่ซ้ำ)
        if (note) {
          var notes = cart[idx].note ? cart[idx].note.split(', ').filter(Boolean) : [];
          if (notes.indexOf(note) === -1) notes.push(note);
          cart[idx].note = notes.join(', ');
        }
        // รวมแอดออน (ชื่อเดียวกันบวก qty)
        cart[idx].addons = cart[idx].addons || [];
        addons.forEach(function(nw){
          var old = cart[idx].addons.find(function(a){ return a.name === nw.name; });
          if (old) old.qty += nw.qty;
          else cart[idx].addons.push(nw);
        });
        // อัปเดตราคาต่อหน่วยเป็นตัวล่าสุด (หรือจะคงเดิมก็ได้)
        cart[idx].price = unit;
      } else {
        cart.push({
          id: Date.now(),
          name: name,
          qty: qty,
          size: size,
          sizeExtra: sizeExtra,
          price: unit,         // ราคาต่อหน่วย (Summary จะคิดรวมเอง)
          image: imgSrc,
          addons: addons,
          note: note
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      window.location.href = "home.html";
    };
  }
})();