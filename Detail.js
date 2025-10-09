
const CART_KEY = "cart";
const BASE_PRICE = 55;          
const SIZE_EXTRA = 10;          
const ADDON_PRICE = 10;         

// --------- helpers: cart storage ----------
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function signatureOf(item){
  const addonsSig = (item.addons||[])
    .filter(a => a.qty>0)
    .map(a => `${a.name}:${a.price}x${a.qty}`).sort().join("|");
  return [item.name, item.price, item.size||"", item.sizeExtra||0, addonsSig, item.note||""].join("#");
}

const $ = (sel) => document.querySelector(sel);
const omeletEl = $("#omelet");
const friedEl  = $("#fried");
const noteEl   = $("#note");
const mainMinus= $("#mainMinus");
const mainPlus = $("#mainPlus");
const mainQtyEl= $("#mainQty");
const totalEl  = $("#totalPrice");
const titleEl  = $("#item-title");
const imgEl    = $("#food-photo");

// ปุ่ม +/- ของ addon (เรียกจาก onclick ใน HTML)
window.chg = function(id, d){
  const el = (id === "omelet") ? omeletEl : friedEl;
  let v = Math.max(0, Math.min(99, (parseInt(el.value || "0", 10) + d)));
  el.value = String(v);
  updateTotal();
};

// จำนวน “จานหลัก”
function getMainQty(){ return Math.max(1, parseInt(mainQtyEl.textContent || "1", 10)); }
function setMainQty(n){ mainQtyEl.textContent = String(Math.max(1, n)); }

// อ่านขนาด
function getSize() {
  const checked = document.querySelector('input[name="size"]:checked');
  if (!checked) return { label: "ปกติ", extra: 0 };
  return checked.value === "special" ? { label: "พิเศษ", extra: SIZE_EXTRA } : { label: "ปกติ", extra: 0 };
}

// คำนวณราคารวมแสดงบนปุ่ม
function computeOnePlate() {
  const { extra } = getSize();
  const addonsTotal = (parseInt(omeletEl.value||"0",10) + parseInt(friedEl.value||"0",10)) * ADDON_PRICE;
  return BASE_PRICE + extra + addonsTotal;
}
function updateTotal(){
  const total = computeOnePlate() * getMainQty();
  totalEl.textContent = "฿" + total.toLocaleString("th-TH");
}

// เพิ่มลงตะกร้า
window.addToCart = function addToCart(){
  const name  = (titleEl?.textContent || "เมนู").trim();
  const image = imgEl?.getAttribute("src") || "";

  const { label:sizeLabel, extra:sizeExtra } = getSize();
  const omeQty = parseInt(omeletEl.value || "0", 10) || 0;
  const friQty = parseInt(friedEl.value  || "0", 10) || 0;
  const qtyMain= getMainQty();
  const note   = (noteEl?.value || "").trim();

  const item = {
    id: Date.now(),
    name,
    price: BASE_PRICE,          // ราคาฐาน
    qty: qtyMain,               // จำนวนจานหลัก
    image,
    size: sizeLabel,            // "ปกติ" | "พิเศษ"
    sizeExtra,                  // 0 หรือ 10
    addons: [
      ...(omeQty > 0 ? [{ name:"ไข่เจียว", price: ADDON_PRICE, qty: omeQty }] : []),
      ...(friQty > 0 ? [{ name:"ไข่ดาว",  price: ADDON_PRICE, qty: friQty  }] : []),
    ],
    note
  };

  const cart = loadCart();
  const sig = signatureOf(item);
  const existIdx = cart.findIndex(x => signatureOf(x) === sig);
  if (existIdx >= 0) {
    cart[existIdx].qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);

  alert("เพิ่มลงตะกร้าแล้ว!");
  window.location.href = "Summary.html";
};

mainMinus?.addEventListener("click", () => { setMainQty(getMainQty()-1); updateTotal(); });
mainPlus ?.addEventListener("click", () => { setMainQty(getMainQty()+1); updateTotal(); });

document.querySelectorAll('input[name="size"]').forEach(r =>
  r.addEventListener("change", updateTotal)
);

updateTotal();
