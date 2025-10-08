// ถ้ามี backend ให้ใส่ URL API ไว้ตรงนี้
const CONFIG = {
    API_CART_URL: null,                 
    API_CREATE_ORDER_URL: null,         
  
    // เส้นทางสำหรับหน้าถัดไป 
    ROUTES: {
      HOME: "home.html",
      SUCCESS: "successful.html",
      FAIL: "unsuccessful.html"
    },
  
    // สำหรับทดสอบ (ตอนไม่มี backend)
    DEMO_CART: [
      { id: 1, name: "ต้มยำกุ้ง", price: 80, qty: 1, image: "img/tomyum.jpg" },
      { id: 2, name: "ผัดไทยกุ้งสด", price: 60, qty: 2, image: "img/padthai.jpg" }
    ]
  };
  
  const toTHB = (n) => `${Number(n || 0).toLocaleString("th-TH")} บาท`;
  const isHttpUrl = (s) => /^https?:\/\//.test(s);
  
  function htmlel(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  
  function readCartFromLocalStorage() {
    const raw = localStorage.getItem("cart");
    if (raw) {
      try { return JSON.parse(raw); } catch { /* ignore */ }
    }
    localStorage.setItem("cart", JSON.stringify(CONFIG.DEMO_CART));
    return CONFIG.DEMO_CART;
  }
  
  /* โหลด cart:
   *  - ถ้า CONFIG.API_CART_URL มีค่า => fetch จาก backend
   *  - ไม่งั้น => localStorage
   */
  async function loadCart() {
    if (CONFIG.API_CART_URL) {
      const res = await fetch(CONFIG.API_CART_URL, { credentials: "include" });
      if (!res.ok) throw new Error(`โหลดตะกร้าล้มเหลว: ${res.status}`);
      return await res.json();
    }
    return readCartFromLocalStorage();
  }
  
  /* บันทึก cart ลง localStorage (ใช้ตอนลบ/เปลี่ยน qty) */
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
// RENDER: วาดการ์ดสินค้า + ปุ่มควบคุมจำนวน (+ / − / ลบ)
// - ตอนยังไม่มี backend: อ่าน/เขียนกับ localStorage
// - ถ้ามี backend: ส่วนควบคุมจำนวนจะไปเรียก API ใน wireQtyActions()
function renderCart(cart) {
    const list = document.querySelector(".menu-list");
    const totalEl = document.getElementById("grand-total");
    const confirmBtn = document.querySelector(".confirm-btn");
  
    list.innerHTML = "";
    let grand = 0;
  
    // เคสตะกร้าว่าง
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
      if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.style.opacity = 0.7; }
      return;
    }
  
    if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.style.opacity = 1; }
  
    // วาดการ์ดทีละชิ้น
    cart.forEach((item, idx) => {
      const lineTotal = (item.qty || 0) * (item.price || 0);
      grand += lineTotal;
  
      // รองรับทั้ง path ภาพแบบสัมพัทธ์และแบบ URL http(s)
      const imgSrc = item.image
        ? (isHttpUrl(item.image) || item.image.startsWith("/") ? item.image : `./${item.image}`)
        : "images/placeholder.jpg";
  
      // id สำหรับจับ DOM/อัปเดต (ถ้าไม่มี id ใช้ name หรือ index)
      const domId = String(item.id ?? item.name ?? idx);
  
      const card = htmlel(`
        <div class="menu-item" data-id="${domId}">
          <div class="menu-img">
            <img src="${imgSrc}" alt="${item.name || "เมนู"}">
          </div>
  
          <div class="menu-name">
            <span>${item.name || "เมนู"}</span>
            <p>จำนวน: <strong class="qty">${item.qty || 0}</strong></p>
            <p>ราคา: <strong class="line-total">${toTHB(lineTotal)}</strong></p>
          </div>
  
          <!-- แผงควบคุมจำนวน -->
          <div class="qty-actions">
            <button class="qty-btn minus" data-action="minus" data-id="${domId}">−</button>
            <span class="qty-count">${item.qty || 0}</span>
            <button class="qty-btn plus"  data-action="plus"  data-id="${domId}">+</button>
            <button class="delete-btn"    data-action="delete" data-id="${domId}">ลบ</button>
          </div>
        </div>
      `);
  
      list.appendChild(card);
    });
  
    // อัปเดตราคารวมทั้งหมด
    totalEl.textContent = toTHB(grand);
    return grand;
  }
  
  
  /* =========[ ย้อนกลับ / ยืนยัน ]========= */
  function wireBackButton() {
    const backBtn = document.querySelector(".back-btn");
    if (!backBtn) return;
    backBtn.addEventListener("click", () => {
      // ถ้ามีหน้า Home ให้ใช้เส้นทางนั้น แทน history.back()
      if (CONFIG.ROUTES.HOME) {
        // history.length > 1 ? history.back() : (location.href = CONFIG.ROUTES.HOME);
        location.href = CONFIG.ROUTES.HOME;
      } else {
        history.back();
      }
    });
  }
  
// ACTION: จัดการคลิกปุ่ม + / − / ลบ บนการ์ด (Event Delegation)
// - ตอนยังไม่มี backend: อัปเดตที่ localStorage -> render ใหม่
// - ถ้ามี backend: เปลี่ยนส่วน TODO ให้ fetch API แล้วค่อยโหลด cart ใหม่
function wireQtyActions() {
    const list = document.querySelector(".menu-list");
    if (!list) return;
  
    list.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
  
      const action = btn.dataset.action; // "plus" | "minus" | "delete"
      const targetId = btn.dataset.id;
  
      // ====== แบบไม่มี backend (default) ======
      // อ่าน/แก้/บันทึกใน localStorage
      let cart = readCartFromLocalStorage();
      const idx = cart.findIndex(it => String(it.id ?? it.name) === String(targetId));
      if (idx === -1) return;
  
      if (action === "plus") {
        cart[idx].qty = (cart[idx].qty || 0) + 1;
      } else if (action === "minus") {
        cart[idx].qty = (cart[idx].qty || 0) - 1;
        if (cart[idx].qty <= 0) cart.splice(idx, 1); // ถ้าจำนวน <= 0 ลบทิ้ง
      } else if (action === "delete") {
        cart.splice(idx, 1);
      }
  
      saveCart(cart);
      renderCart(cart);
  
      // ====== TODO: ถ้ามี backend ให้แทนที่บล็อกด้านบนด้วยการเรียก API ======
      // ตัวอย่าง (สมมติ endpoint):
      // if (CONFIG.API_CART_URL) {
      //   try {
      //     if (action === "plus")   await fetch(`${CONFIG.API_CART_URL}/${targetId}/qty`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ delta:+1 }) });
      //     if (action === "minus")  await fetch(`${CONFIG.API_CART_URL}/${targetId}/qty`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ delta:-1 }) });
      //     if (action === "delete") await fetch(`${CONFIG.API_CART_URL}/${targetId}`,      { method: "DELETE" });
      //     const fresh = await loadCart();   // ดึง cart ล่าสุดจาก backend
      //     renderCart(fresh);
      //   } catch(err){ console.error(err); }
      // }
    });
  }
  

  async function submitOrder(cart, grandTotal) {
    // ถ้ามี API สำหรับสร้างคำสั่งซื้อ => POST
    if (CONFIG.API_CREATE_ORDER_URL) {
      const res = await fetch(CONFIG.API_CREATE_ORDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: cart, total: grandTotal })
      });
      if (!res.ok) throw new Error(`สั่งซื้อไม่สำเร็จ: ${res.status}`);
      return await res.json(); // สมมติ backend ส่ง { orderId, status } กลับมา
    }
  
    // ถ้าไม่มี backend: จำลอง 85% สำเร็จ
    const success = Math.random() < 0.85;
    return { status: success ? "success" : "fail" };
  }
  
  function wireConfirmButton(cartProvider) {
    const btn = document.querySelector(".confirm-btn");
    if (!btn) return;
  
    btn.addEventListener("click", async () => {
      btn.disabled = true; btn.style.opacity = 0.7;
  
      try {
        const cart = await cartProvider();        // อ่าน cart ล่าสุด (เผื่อมีแก้ qty ในอนาคต)
        const grand = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
  
        const result = await submitOrder(cart, grand);
  
        if (result.status === "success") {
          // ล้าง cart ฝั่ง front (เฉพาะเคสไม่มี backend)
          if (!CONFIG.API_CREATE_ORDER_URL) localStorage.removeItem("cart");
          // แนบยอดรวมไปหน้า success (ผ่าน query string)
          const url = new URL(CONFIG.ROUTES.SUCCESS, location.href);
          url.searchParams.set("total", grand);
          location.href = url.toString();
        } else {
          location.href = CONFIG.ROUTES.FAIL;
        }
      } catch (err) {
        console.error(err);
        location.href = CONFIG.ROUTES.FAIL;
      } finally {
        // ปล่อยปุ่ม (กันกรณีเปลี่ยนใจไม่ออกหน้าใหม่)
        setTimeout(() => { btn.disabled = false; btn.style.opacity = 1; }, 600);
      }
    });
  }
  
  /* =========[ BOOTSTRAP ]========= */
  document.addEventListener("DOMContentLoaded", async () => {
    wireBackButton();
  
    // provider: โหลด cart ใหม่เสมอก่อน submit
    const getCart = async () => {
      try { return await loadCart(); }
      catch (e) { console.error(e); return []; }
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
  