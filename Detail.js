// Detail.js

// ====== CONFIG ======
const BASE_PRICE = 55;           // ราคาพื้นฐาน "ข้าวผัดกะเพรา"
const EXTRA_PRICE = 10;          // ราคาเพิ่มของ "พิเศษ" และไข่แต่ละใบ
const IMG_PATH = document.getElementById("food-photo").getAttribute("src");

// ====== DOM ======
const qtyMain      = document.getElementById("mainQty");
const btnMinusMain = document.getElementById("mainMinus");
const btnPlusMain  = document.getElementById("mainPlus");
const priceEl      = document.getElementById("totalPrice");

// ช่องไข่
const omeletInput  = document.getElementById("omelet");
const friedInput   = document.getElementById("fried");

// ====== UTILS ======
const clamp = (n, min=0, max=999) => Math.min(Math.max(n, min), max);
const getInt = (el) => parseInt(el.value || "0", 10) || 0;

function getSizeExtra() {
  const checked = document.querySelector('input[name="size"]:checked')?.value;
  return checked === "special" ? EXTRA_PRICE : 0;
}

function getSizeLabel() {
  const checked = document.querySelector('input[name="size"]:checked')?.value;
  return checked === "special" ? "พิเศษ" : "ปกติ";
}

function computeUnitPrice() {
  const extraEggs = (getInt(omeletInput) + getInt(friedInput)) * EXTRA_PRICE;
  return BASE_PRICE + getSizeExtra() + extraEggs;
}

function computeTotal() {
  return computeUnitPrice() * (parseInt(qtyMain.textContent, 10) || 1);
}

// ====== RENDER PRICE ======
function renderPrice() {
  const total = computeTotal();
  priceEl.textContent = `฿${total.toLocaleString("th-TH")}`;
}

// ====== QTY HANDLERS ======
function chg(id, step) {
  const el = document.getElementById(id);
  el.value = clamp(getInt(el) + step);
  renderPrice();
}
window.chg = chg; // ให้ปุ่มใน HTML เรียกใช้ได้

btnMinusMain.addEventListener("click", () => {
  const now = clamp((parseInt(qtyMain.textContent, 10) || 1) - 1, 1);
  qtyMain.textContent = now;
  renderPrice();
});

btnPlusMain.addEventListener("click", () => {
  const now = clamp((parseInt(qtyMain.textContent, 10) || 1) + 1, 1);
  qtyMain.textContent = now;
  renderPrice();
});

// เมื่อเปลี่ยน ปกติ/พิเศษ ให้คำนวณใหม่
document.querySelectorAll('input[name="size"]').forEach(r =>
  r.addEventListener("change", renderPrice)
);

// คำนวณราคาเริ่มต้น
renderPrice();

// ====== ADD TO CART ======
function addToCart() {
  const name = document.getElementById("item-title").textContent.trim();
  const sizeLabel = getSizeLabel();
  const note = (document.getElementById("note").value || "").trim();
  const qty = parseInt(qtyMain.textContent, 10) || 1;

  const extras = {
    "ไข่เจียว": getInt(omeletInput),
    "ไข่ดาว": getInt(friedInput)
  };

  const unitPrice = computeUnitPrice(); // ราคารายการต่อจาน (รวมพิเศษ/ไข่แล้ว)
  const item = {
    id: Date.now(),     // ไว้ลบ/อัปเดต
    name,
    size: sizeLabel,
    qty,
    price: unitPrice,   // เก็บเป็น "ราคาต่อหน่วย" จะสะดวกต่อการคิดรวม
    img: IMG_PATH,
    note,
    extras // เก็บ breakdown ของไข่เพื่อแสดงผล
  };

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));

  // ไปหน้าสรุป
  window.location.href = "Summary.html";
}
window.addToCart = addToCart;
