const CONFIG = {
  API_CART_URL: null,
  API_CREATE_ORDER_URL: "http://localhost:8081/api/orders",

  ROUTES: {
    HOME: "index.html",
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

const isAbsoluteUrl2 = (s) =>
  /^(https?:|file:)/.test(s || "") || (s || "").startsWith("/");

function safeJoin(base, file) {
  const b = String(base || "").replace(/\\/g, "/");
  const f = String(file || "").replace(/\\/g, "/");
  if (!f) return "img/placeholder.webp";
  if (isAbsoluteUrl2(f) || f.startsWith("./")) return f;

  const fullPath = b + (b.endsWith("/") ? "" : "/") + f;
  return fullPath;
}

function buildImageSrc(item) {
  const file = item.image || "";
  const base = item.imgBase || "";

  if (!file && !base) return "img/placeholder.webp";
  if (isAbsoluteUrl2(file) || file.startsWith("./") || file.includes("/")) {
    return file;
  }
  if (base) {
    return safeJoin(base, file);
  }
  return file || "img/placeholder.webp";
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

    const imgSrc = buildImageSrc(item);
    const domId = String(item.id ?? item.name ?? idx);

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
      ? `${item.size}${
          item.sizeExtra ? ` (+${toTHB(item.sizeExtra)})` : ""
        }`
      : "";

    const card = htmlel(`
      <div class="menu-item" data-id="${domId}">
        <div class="menu-img">
          <img src="${imgSrc}" alt="${item.name || "เมนู"}"
               onerror="this.onerror=null;this.src='img/placeholder.webp';">
        </div>

        <div class="menu-name">
          <span>${item.name || "เมนู"}</span>
          ${sizeView ? `<p>ขนาด: ${sizeView}</p>` : ""}
          ${addonsView ? `<p class="extras">เพิ่ม: ${addonsView}</p>` : ""}
          ${item.note ? `<p class="note">หมายเหตุ: ${item.note}</p>` : ""}
          <p>จำนวน: <strong class="qty">${item.qty || 0}</strong></p>
          <p>ราคา: <strong class="line-total">${toTHB(lineTotal)}</strong></p>
        </div>

        <div class="qty-actions">
          <button class="qty-btn minus" data-action="minus" data-id="${domId}">−</button>
          <span class="qty-count">${item.qty || 0}</span>
          <button class="qty-btn plus" data-action="plus" data-id="${domId}">+</button>
          <button class="delete-btn" data-action="delete" data-id="${domId}">ลบ</button>
        </div>
      </div>
    `);

    list.appendChild(card);
  });

  totalEl.textContent = toTHB(grand);
  return grand;
}

function wireBackButton() {
  const backBtn = document.querySelector(".back-btn");
  if (!backBtn) return;
  backBtn.addEventListener("click", () => {
    location.href = CONFIG.ROUTES.HOME;
  });
}

function wireQtyActions() {
  const list = document.querySelector(".menu-list");
  if (!list) return;

  list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const targetId = btn.dataset.id;

    let cart = readCartFromLocalStorage();
    const idx = cart.findIndex(
      (it) => String(it.id ?? it.name) === String(targetId)
    );
    if (idx === -1) return;

    if (action === "plus") {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else if (action === "minus") {
      cart[idx].qty = (cart[idx].qty || 0) - 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    } else if (action === "delete") {
      cart.splice(idx, 1);
    }

    saveCart(cart);
    renderCart(cart);
  });
}

async function submitOrder(cart, grandTotal) {
  if (CONFIG.API_CREATE_ORDER_URL) {
    // แปลง addons เป็นข้อความอังกฤษ (สำหรับ noteText)
    const toEnglishAddons = (addons = []) =>
      addons
        .filter(a => Number(a.qty) > 0)
        .map(a => {
          let name = String(a.name || "");
          // แปลงคำไทย -> อังกฤษ
          name = name
            .replace("ความหวาน", "sweetness")
            .replace("ขวดใหญ่", "large bottle")
            .replace("ไข่ดาว", "fried egg")
            .replace("ไข่เจียว", "omelet")
            .replace("พิเศษ", "special");
          return `${name} x${a.qty}`;
        })
        .join(", ");

    // เตรียม orderItems ให้สะอาด + คิดราคาเพิ่มให้ถูกต้อง
    const items = cart.map(it => {
      const qty = Number(it.qty || 0);
      const sizeExtraPerUnit = Number(it.sizeExtra || 0);

      // รวมราคารวมของ addons (price * qty ของ addon)
      const addonsTotal = (it.addons || []).reduce((s, a) => {
        const p = Number(a.price || 0);
        const q = Number(a.qty || 0);
        return s + p * q;
      }, 0);

      // additionalPrice ทั้งบรรทัด = sizeExtra ต่อชิ้น * จำนวน + addons รวม
      const additionalPrice = sizeExtraPerUnit * qty + addonsTotal;

      // รวม noteText เป็นอังกฤษ
      const addonsText = toEnglishAddons(it.addons);
      const noteText = addonsText || String(it.note || "");

      // ใส่ menuId เฉพาะกรณีที่เป็นตัวเลขจริงเท่านั้น
      const mid = Number(it.menuId);
      const line = {
        quantity: qty,
        additionalPrice: additionalPrice,
        noteText: noteText
      };
      if (Number.isFinite(mid) && mid > 0) {
        line.menuId = mid; // ✅ มีค่าเท่านั้นถึงจะส่ง
      }
      return line;
    });

    const res = await fetch(CONFIG.API_CREATE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalAmount: grandTotal,
        paymentStatus: "pending",
        orderItems: items
      }),
    });

    if (!res.ok) throw new Error(`สั่งซื้อไม่สำเร็จ: ${res.status}`);

    const data = await res.json();
    data.status = "success";
    return data;
  }
}


function clearCart() {
  localStorage.removeItem("cart");
  localStorage.removeItem("pending_add");
  console.log("[Summary] ✅ ล้างตะกร้าสำเร็จ");
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
    console.error("โหลดข้อมูลตะกร้าไม่สำเร็จ", e);
    renderCart([]);
  }

  wireConfirmButton(getCart);
  wireQtyActions();
});