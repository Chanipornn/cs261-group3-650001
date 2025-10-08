(function () {
    const STORAGE_KEY = 'simple_cart_v1';
    const menuList = document.querySelector('.menu-list');
  
    const cartBadge = document.querySelector('.cart-badge');
  
    const cart = loadCart();
  
    function createQtyControl(count) {
      const wrapper = document.createElement('div');
      wrapper.className = 'qty-control';
  
      const btnMinus = document.createElement('button');
      btnMinus.type = 'button';
      btnMinus.className = 'minus';
      btnMinus.textContent = '−';
  
      const span = document.createElement('span');
      span.className = 'count';
      span.textContent = String(count);
  
      const btnPlus = document.createElement('button');
      btnPlus.type = 'button';
      btnPlus.className = 'plus';
      btnPlus.textContent = '+';
  
      wrapper.appendChild(btnMinus);
      wrapper.appendChild(span);
      wrapper.appendChild(btnPlus);
  
      return wrapper;
    }
  
    function updateItemUI(itemEl, itemId) {
      const box = itemEl.querySelector('.image-box');
      const existingAdd = box.querySelector('.add-btn');
      const existingQty = box.querySelector('.qty-control');
      const count = cart[itemId] || 0;
  
      if (count > 0) {
        if (!existingQty) {
          const qtyControl = createQtyControl(count);
          if (existingAdd) existingAdd.remove();
          box.appendChild(qtyControl);
        } else {
          existingQty.querySelector('.count').textContent = String(count);
        }
      } else {
        if (!existingAdd) {
          const addBtn = document.createElement('div');
          addBtn.className = 'add-btn';
          addBtn.dataset.action = 'add';
          addBtn.textContent = '+';
          if (existingQty) existingQty.remove();
          box.appendChild(addBtn);
        } else {
          if (existingQty) existingQty.remove();
        }
      }
    }
  
    function updateCartBadge() {
      if (!cartBadge) return;
      const total = Object.values(cart).reduce((s, v) => s + v, 0);
      if (total > 0) {
        cartBadge.textContent = String(total);
        cartBadge.style.display = 'inline-block';
      } else {
        cartBadge.style.display = 'none';
      }
    }
  
    function saveCart() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.warn('ไม่สามารถบันทึก localStorage:', e);
      }
    }
  
    function loadCart() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
      } catch (e) {
        console.warn('โหลด cart ผิดพลาด, เริ่มใหม่:', e);
        return {};
      }
    }
  
    document.querySelectorAll('.menu-item').forEach(mi => {
      const id = mi.dataset.id;
      if (!(id in cart)) cart[id] = 0;
      updateItemUI(mi, id);
    });
    updateCartBadge();
  
    menuList.addEventListener('click', function (e) {
      const addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        const menuItem = addBtn.closest('.menu-item');
        const id = menuItem.dataset.id;
        cart[id] = (cart[id] || 0) + 1;
        updateItemUI(menuItem, id);
        saveCart();
        updateCartBadge();
        return;
      }
  
      const plus = e.target.closest('.qty-control .plus');
      if (plus) {
        const menuItem = plus.closest('.menu-item');
        const id = menuItem.dataset.id;
        cart[id] = (cart[id] || 0) + 1;
        updateItemUI(menuItem, id);
        saveCart();
        updateCartBadge();
        return;
      }
  
      const minus = e.target.closest('.qty-control .minus');
      if (minus) {
        const menuItem = minus.closest('.menu-item');
        const id = menuItem.dataset.id;
        cart[id] = Math.max(0, (cart[id] || 0) - 1);
        updateItemUI(menuItem, id);
        saveCart();
        updateCartBadge();
        return;
      }
    });
  
  })();
  