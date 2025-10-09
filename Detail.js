(function () {
  const STORAGE_KEY = 'simple_cart_v1';
  const MENU_ID_FALLBACK = 'kapow_gai';
  const BASE_PRICE = 55;
  const EXTRA_PRICE = 10;

  const inputs = {
    omelet: document.getElementById('omelet'),
    fried: document.getElementById('fried')
  };

  let mainQty = 1;
  const elMainQty = document.getElementById('mainQty');
  const btnMinus = document.getElementById('mainMinus');
  const btnPlus = document.getElementById('mainPlus');
  const totalPrice = document.getElementById('totalPrice');

  // เพิ่ม/ลด add-on
  window.chg = function (id, d) {
    const el = inputs[id];
    let v = parseInt(el.value || '0', 10) + d;
    if (v < 0) v = 0;
    if (v > 5) v = 5;
    el.value = v;
    recalc();
  };

  // ปุ่มจำนวนหลัก
  btnMinus.addEventListener('click', () => {
    if (mainQty > 1) { mainQty--; recalc(); }
  });
  btnPlus.addEventListener('click', () => {
    if (mainQty < 99) { mainQty++; recalc(); }
  });

  // ฟังก์ชันคำนวณราคา
  function recalc() {
    const size = document.querySelector('input[name="size"]:checked').value;
    const isSpecial = size === 'special' ? 1 : 0;
    const omeletQty = parseInt(inputs.omelet.value, 10) || 0;
    const friedQty = parseInt(inputs.fried.value, 10) || 0;

    const perDish =
      BASE_PRICE + isSpecial * EXTRA_PRICE +
      omeletQty * EXTRA_PRICE + friedQty * EXTRA_PRICE;

    const total = perDish * mainQty;

    elMainQty.textContent = String(mainQty);
    totalPrice.textContent = '฿' + total.toLocaleString('th-TH');
  }

  document.querySelectorAll('input[name="size"]').forEach(r => {
    r.addEventListener('change', recalc);
  });

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }
  function readPendingAdd() {
    try {
      return JSON.parse(localStorage.getItem('pending_add')) || null;
    } catch { return null; }
  }

  // ปุ่มยืนยัน
  window.addToCart = function () {
    const size = document.querySelector('input[name="size"]:checked').value;
    const omeletQty = parseInt(inputs.omelet.value, 10) || 0;
    const friedQty = parseInt(inputs.fried.value, 10) || 0;
    const note = document.getElementById('note').value.trim();

    const pending = readPendingAdd();
    const menuId = pending?.id || MENU_ID_FALLBACK;

    const cart = loadCart();
    cart[menuId] = (cart[menuId] || 0) + mainQty;
    saveCart(cart);

    localStorage.setItem(
      'last_added_detail',
      JSON.stringify({
        id: menuId,
        name: document.getElementById('item-title').textContent.trim(),
        size, omeletQty, friedQty, note, mainQty,
        timestamp: Date.now()
      })
    );

    localStorage.removeItem('pending_add');
    window.location.href = 'Home.html';
  };

  recalc();
})();