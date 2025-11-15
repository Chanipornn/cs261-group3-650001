const CONFIG = {
  API_CART_URL: null,
  API_CREATE_ORDER_URL: "http://localhost:8081/api/orders",

  ROUTES: {
    HOME: "menu.html",
    SUCCESS: "received.html",
    FAIL: "unsuccessful.html",
  },
};

const toTHB = (n) => `${Number(n || 0).toLocaleString("th-TH")} บาท`;

function htmlel(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function readCartFromLocalStorage() {
  const raw = localStorage.getItem("cart");
  if (raw) {
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  return [];
}

function calcLineTotal(item) {
  const perUnit = Number(item?.price || 0);
  const qty = Number(item?.qty || 0);
  return perUnit * qty;
}

async function loadCart() {
  if (CONFIG.API_CART_URL) {
    const res = await fetch(CONFIG.API_CART_URL, { credentials: "include" });
    if (!res.ok) throw new Error(`โหลดตะกร้าล้มเหลว: ${res.status}`);
    return await res.json();
  }
  return readCartFromLocalStorage();
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function safeJoin(base, file) {
  const b = String(base || "").replace(/\\/g, "/");
  const f = String(file || "").replace(/\\/g, "/");
  if (!f) return "img/placeholder.webp";
  if (/^(https?:|file:)/.test(f) || f.startsWith("./") || f.includes("/"))
    return f;

  return b + (b.endsWith("/") ? "" : "/") + f;
}

function buildImageSrc(item) {
  return item.image || "img/placeholder.webp";
}

/* 
===============================
รวม Size + Addons + Note → noteText
===============================
*/
function buildNoteText(item) {
  const parts = [];

  if (item.size && item.size.name) {
    parts.push(item.size.name);
  }

  if (item.addons && item.addons.length > 0) {
    item.addons.forEach((a) => {
      if (a.qty > 0) parts.push(`${a.name} x${a.qty}`);
    });
  }

  if (item.note && item.note.trim() !== "") {
    parts.push(item.note.trim());
  }

  return parts.join(", ");
}

function renderCart(cart) {
  const list = document.querySelector(".menu-list");
  const totalEl = document.getElementById("grand-total");
  const confirmBtn = document.querySelector(".confirm-btn");
  list.innerHTML = "";
  let grand = 0;

  if (!cart || cart.length === 0) {
    list.appendChild(
      htmlel(`
        <div class="menu-item" style="justify-content:center;">
          <div class="menu-name" style="text-align:center;">
            <span>ยังไม่มีรายการในตะกร้า</span>
            <p>เลือกเมนูจากหน้าหลักเพื่อเริ่มสั่งซื้อ</p>
          </div>
        </div>
      `)
    );
    totalEl.textContent = toTHB(0);
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = 0.7;
    }
    return;
  }

  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = 1;
  }

  cart.forEach((item, idx) => {
    const lineTotal = calcLineTotal(item);
    grand += lineTotal;

    const addonsView = (item.addons || [])
      .filter((a) => Number(a.qty || 0) > 0)
      .map(
        (a) =>
          `${a.name} ×${a.qty}${
            a.price > 0 ? " (+" + toTHB(a.price * a.qty) + ")" : ""
          }`
      )
      .join(" · ");

    const sizeView = item.size
      ? `${item.size.name}${
          item.size.price > 0
            ? ` (+${toTHB(item.size.price * item.qty)})`
            : ""
        }`
      : "";

    const card = htmlel(`
      <div class="menu-item" data-id="${idx}">
        <div class="menu-img">
          <img src="${buildImageSrc(item)}" alt="${item.name}">
        </div>

        <div class="menu-name">
          <span>${item.name}</span>
          ${sizeView ? `<p>รูปแบบ: ${sizeView}</p>` : ""}
          ${addonsView ? `<p class="extras">เพิ่ม: ${addonsView}</p>` : ""}
          ${item.note ? `<p class="note">หมายเหตุ: ${item.note}</p>` : ""}
          <p>จำนวน: <strong>${item.qty}</strong></p>
          <p>ราคา: <strong>${toTHB(lineTotal)}</strong></p>
        </div>

        <div class="qty-actions">
          <button class="delete-btn" data-action="delete" data-id="${idx}">ลบ</button>
        </div>
      </div>
    `);

    list.appendChild(card);
  });

  totalEl.textContent = toTHB(grand);
  return grand;
}
function wireDeleteButtons() {
  const list = document.querySelector(".menu-list");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("button.delete-btn");
    if (!btn) return;

    const idx = Number(btn.dataset.id);
    let cart = readCartFromLocalStorage();

    if (idx >= 0 && idx < cart.length) {
      cart.splice(idx, 1); // ลบรายการในตำแหน่ง idx
      saveCart(cart);
      renderCart(cart); // รีเฟรชหน้าตะกร้า
    }
  });
}

/*
===============================
คำนวณ additionalPrice แบบถูกต้อง
===============================
*/
function calcAdditionalPrice(item) {
  const qty = Number(item.qty || 0);
  const sizeExtra = item.size ? Number(item.size.price || 0) : 0;

  const addonsTotal = (item.addons || []).reduce((sum, a) => {
    return sum + Number(a.price || 0) * Number(a.qty || 0);
  }, 0);

  return sizeExtra * qty + addonsTotal;
}

/*
===============================
ส่งออเดอร์ไป backend
===============================
*/
async function submitOrder(cart, grandTotal) {
  const items = cart.map((it) => ({
    quantity: Number(it.qty),
    additionalPrice: calcAdditionalPrice(it),
    noteText: buildNoteText(it),
    menuId: Number(it.menuId),
  }));

  const res = await fetch(CONFIG.API_CREATE_ORDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      totalAmount: grandTotal,
      paymentStatus: "pending",
	  orderTypeId: Number(localStorage.getItem("orderTypeId") || 1),
      items: items,
    }),
  });

  if (!res.ok) throw new Error(`สั่งซื้อไม่สำเร็จ: ${res.status}`);

  const data = await res.json();
  data.status = "success";
  return data;
}

function clearCart() {
  localStorage.removeItem("cart");
  localStorage.removeItem("pending_add");
}

function wireConfirmButton(cartProvider) {
  const btn = document.querySelector(".confirm-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.style.opacity = 0.7;

    try {
      const cart = await cartProvider();
      const grand = cart.reduce((s, it) => s + calcLineTotal(it), 0);

      const result = await submitOrder(cart, grand);

      if (result.status === "success") {
        clearCart();
        const url = new URL(CONFIG.ROUTES.SUCCESS, location.href);
        url.searchParams.set("total", grand);
        location.href = url.toString();
      } else {
        location.href = CONFIG.ROUTES.FAIL;
      }
    } catch (err) {
      console.error("❌ Error while posting order:", err);
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.style.opacity = 1;
      }, 600);
    }
  });
}
function wireBackButton() {
  const backBtn = document.querySelector(".back-btn");
  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    window.location.href = "menu.html";  // กลับไปหน้าเมนู
  });
}


document.addEventListener("DOMContentLoaded", async () => {
wireBackButton();  
  const getCart = async () => {
    try {
      return await loadCart();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  try {
    const cart = await getCart();
    renderCart(cart);
  } catch (e) {
    renderCart([]);
  }
  wireDeleteButtons(); 
  wireConfirmButton(getCart);
});
