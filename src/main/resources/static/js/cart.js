// js/cart.js  (type="module")
const CART_KEY = 'tu_cart';

const readCart  = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const writeCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const cartCount = (cart) => cart.reduce((s,i)=> s + (Number(i.qty)||0), 0);

export function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const n = cartCount(readCart());
  badge.textContent = n;
  badge.style.display = n > 0 ? 'inline-flex' : 'none';
}

export function addToCart(item) {
  const cart = readCart();
  const menuId = Number(item.id); // ✅ ใช้ id จาก data-id (ของ DB)

  const existing = cart.find(x => x.menuId === menuId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      menuId,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: 1,
      note: ""
    });
  }

  writeCart(cart);
  updateCartBadge();
}
// === ผูกปุ่มแบบ Event Delegation (ใช้ได้ทุกหน้า) ===
function bindAddButtonsGlobally(){
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="add"]');
    if (!btn) return;

    const card = btn.closest('.menu-item');
    if (!card) return;

    const id = card.dataset.id;
    const name = card.querySelector('p')?.textContent.trim() || '';
    const priceText = card.querySelector('.price')?.textContent || '0';
    const price = Number(priceText.replace(/[^\d.]/g, '')) || 0;
    const image = card.querySelector('img')?.getAttribute('src') || '';

	addToCart({ id: Number(id), name, price, image });
  });	
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  bindAddButtonsGlobally();
});
