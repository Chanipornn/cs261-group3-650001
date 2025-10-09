<script>
// ช่วยเพิ่ม/ลดจำนวนใน input[type=number]
function stepQty(id, d){
  const el = document.getElementById(id);
  const v  = Math.max(0, (parseInt(el.value,10) || 0) + d);
  el.value = v;
}

/* ===== Cart helpers (localStorage) ===== */
function getCart(){ try { return JSON.parse(localStorage.getItem("cart")||"[]"); } catch { return []; } }
function setCart(c){ localStorage.setItem("cart", JSON.stringify(c)); }

function signatureOf(item){
  const addonsSig = (item.addons||[])
    .filter(a => a.qty>0)
    .map(a => `${a.name}:${a.price}x${a.qty}`).sort().join("|");
  return [
    item.name, item.price, item.size||"", item.sizeExtra||0, addonsSig, item.note||""
  ].join("#");
}

function addToCartFromDetail(){
  const root = document.getElementById("detail-root");
  const name  = root.dataset.name;
  const basePrice = Number(root.dataset.price || 0);
  const image = root.dataset.image;

  const sizeInput = document.querySelector('input[name="size"]:checked');
  const size = sizeInput ? sizeInput.value : "";
  const sizeExtra = Number(sizeInput?.dataset.extra || 0);

  const addons = Array.from(document.querySelectorAll(".addon-row")).map(row => {
    const qtyEl = row.querySelector('input[type="number"]');
    const qty = Number(qtyEl?.value || 0);
    return {
      name:  row.dataset.name,
      price: Number(row.dataset.price || 0),
      qty
    };
  }).filter(a => a.qty > 0);

  const note = (document.getElementById("detail-note")?.value || "").trim();

  // 5) สร้าง item
  const item = {
    id: Date.now(),         // id ชั่วคราวฝั่ง front
    name,
    price: basePrice,       // ราคาฐาน
    qty: 1,                 // เพิ่มครั้งละ 1 ที่
    image,
    size,
    sizeExtra,
    addons,
    note
  };

  const cart = getCart();
  const sig = signatureOf(item);
  const idx = cart.findIndex(x => signatureOf(x) === sig);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push(item);
  }
  setCart(cart);

  alert("เพิ่มลงตะกร้าแล้ว!");
}

document.getElementById("btn-add-to-cart")?.addEventListener("click", addToCartFromDetail);
</script>
