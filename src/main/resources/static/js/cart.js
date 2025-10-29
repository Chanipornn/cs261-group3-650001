const CART_KEY = 'cart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function countCart(cart) {
  return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart = readCart();
  const n = countCart(cart);
  badge.textContent = n;
  badge.style.display = n > 0 ? 'inline-flex' : 'none';
}

document.addEventListener('DOMContentLoaded', updateCartBadge);