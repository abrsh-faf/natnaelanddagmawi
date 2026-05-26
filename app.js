/* =============================================
   Natnael & Dagmawi — app.js
   ============================================= */

'use strict';

/* ---------- Product Data ---------- */
const PRODUCTS = [
  { id:'restored-leather-bag',      img:'images/product-bag.jpg',     name:'Restored Leather Bag',     price:3500, label:'ETB 3,500', cat:'Bags',        cond:'Restored'    },
  { id:'classic-bi-fold-wallet',    img:'images/product-wallet.jpg',  name:'Classic Bi-fold Wallet',   price:1200, label:'ETB 1,200', cat:'Wallets',     cond:'Refurbished' },
  { id:'artisan-leather-belt',      img:'images/product-belt.jpg',    name:'Artisan Leather Belt',     price:800,  label:'ETB 800',   cat:'Belts',       cond:'Rebuilt'     },
  { id:'oxford-leather-shoes',      img:'images/product-shoes.jpg',   name:'Oxford Leather Shoes',     price:4200, label:'ETB 4,200', cat:'Shoes',       cond:'Restored'    },
  { id:'embossed-leather-journal',  img:'images/product-journal.jpg', name:'Embossed Leather Journal', price:1800, label:'ETB 1,800', cat:'Accessories', cond:'Rebuilt'     },
  { id:'leather-laptop-sleeve',     img:'images/product-sleeve.jpg',  name:'Leather Laptop Sleeve',    price:2600, label:'ETB 2,600', cat:'Accessories', cond:'Refurbished' },
];

/* ---------- Cart State ---------- */
let cart = [];

function cartTotal()  { return cart.reduce((s,i) => s + i.price * i.qty, 0); }
function cartCount()  { return cart.reduce((s,i) => s + i.qty, 0); }

function addToCart(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty++;
  else cart.push({ ...p, qty: 1 });
  renderCart();
  animateBadge();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  renderCart();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

/* ---------- Cart Render ---------- */
function renderCart() {
  const count = cartCount();
  const total = cartTotal();

  // badge
  const badge = document.getElementById('cartBadge');
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);

  // sidebar items
  const itemsEl   = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footerEl  = document.getElementById('cartFooter');
  const totalEl   = document.getElementById('cartTotal');

  if (cart.length === 0) {
    emptyEl.style.display  = 'flex';
    itemsEl.style.display  = 'none';
    footerEl.style.display = 'none';
  } else {
    emptyEl.style.display  = 'none';
    itemsEl.style.display  = 'flex';
    footerEl.style.display = 'block';
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}"/>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.label}</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="updateQty('${item.id}',-1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}',+1)">+</button>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">🗑</button>
          </div>
        </div>
      </div>`).join('');
    totalEl.textContent = 'ETB ' + total.toLocaleString();
  }

  // also update checkout page if visible
  renderCheckoutSummary();
}

function animateBadge() {
  const badge = document.getElementById('cartBadge');
  badge.classList.remove('bounce');
  void badge.offsetWidth;
  badge.classList.add('bounce');
}

/* ---------- Cart Sidebar ---------- */
function openCart()  {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

/* ---------- Navigation ---------- */
const PAGES = ['home','shop','sell','about','checkout'];

function navigate(page) {
  // hide all
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });
  // show target
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // update nav links
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  window.scrollTo(0, 0);
  closeCart();

  // page-specific init
  if (page === 'shop')     renderShop('All');
  if (page === 'checkout') renderCheckoutPage();
}

/* ---------- Shop ---------- */
let activeFilter = 'All';

function renderShop(filter) {
  activeFilter = filter;
  const list = filter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  document.getElementById('shopGrid').innerHTML = list.map(p => productCardHTML(p)).join('');

  document.querySelectorAll('.pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.cat === filter);
  });
}

function productCardHTML(p) {
  return `
    <div class="product-card">
      <div style="overflow:hidden">
        <img src="${p.img}" alt="${p.name}" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;transition:transform .5s"/>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-category">${p.cat}</span>
          <span class="product-badge">${p.cond}</span>
        </div>
        <h3>${p.name}</h3>
        <div class="product-footer">
          <span class="product-price">${p.label}</span>
          <button class="btn btn-primary btn-sm" onclick="addToCart('${p.id}')">Add to Cart</button>
        </div>
      </div>
    </div>`;
}

/* ---------- Home Featured Products ---------- */
function renderFeatured() {
  const featured = PRODUCTS.slice(0, 3);
  document.getElementById('featuredGrid').innerHTML = featured.map(p => productCardHTML(p)).join('');
}

/* ---------- Sell Form ---------- */
let sellPhotos = [];

function initSellPage() {
  sellPhotos = [];
  renderPhotoPreview();
  document.getElementById('sellThanks').style.display = 'none';
  document.getElementById('sellFormWrap').style.display = 'block';
  document.getElementById('sellFormEl').reset();
}

function handleSellFiles(files) {
  const remaining = 5 - sellPhotos.length;
  const newFiles = Array.from(files).slice(0, remaining);
  newFiles.forEach(file => {
    sellPhotos.push({ url: URL.createObjectURL(file) });
  });
  renderPhotoPreview();
}

function removePhoto(i) {
  URL.revokeObjectURL(sellPhotos[i].url);
  sellPhotos.splice(i, 1);
  renderPhotoPreview();
}

function renderPhotoPreview() {
  const grid = document.getElementById('photoPreview');
  const uploadArea = document.getElementById('uploadArea');
  grid.innerHTML = sellPhotos.map((p, i) => `
    <div class="photo-preview">
      <img src="${p.url}" alt="upload ${i+1}"/>
      <button class="photo-remove" onclick="removePhoto(${i})" type="button">✕</button>
    </div>`).join('');
  uploadArea.style.display = sellPhotos.length >= 5 ? 'none' : 'block';
  const hint = document.getElementById('uploadHint');
  if (hint) hint.textContent = sellPhotos.length === 0
    ? 'Drag & drop photos or click to upload (max 5)'
    : `Add more photos (${5 - sellPhotos.length} remaining)`;
}

function submitSell(e) {
  e.preventDefault();
  document.getElementById('sellFormWrap').style.display = 'none';
  document.getElementById('sellThanks').style.display = 'block';
  window.scrollTo(0, 0);
}

/* ---------- Contact Form ---------- */
function submitContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Sent ✓';
  btn.disabled = true;
  const msg = document.getElementById('contactSuccess');
  if (msg) { msg.classList.add('show'); }
  setTimeout(() => {
    e.target.reset();
    btn.textContent = 'Send Message';
    btn.disabled = false;
    if (msg) msg.classList.remove('show');
  }, 3000);
}

/* ---------- Checkout ---------- */
function renderCheckoutPage() {
  const page = document.getElementById('page-checkout');
  const emptyEl = document.getElementById('checkoutEmpty');
  const mainEl  = document.getElementById('checkoutMain');
  if (cart.length === 0) {
    emptyEl.style.display = 'flex';
    mainEl.style.display  = 'none';
  } else {
    emptyEl.style.display = 'none';
    mainEl.style.display  = 'block';
    renderCheckoutSummary();
  }
}

function renderCheckoutSummary() {
  const el = document.getElementById('checkoutSummaryItems');
  const totalEl = document.getElementById('checkoutSummaryTotal');
  const btnEl   = document.getElementById('placeOrderBtn');
  if (!el) return;
  const total = cartTotal();
  el.innerHTML = cart.map(item => `
    <div class="order-item">
      <img src="${item.img}" alt="${item.name}"/>
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-qty">Qty: ${item.qty}</div>
      </div>
      <span class="order-item-price">ETB ${(item.price * item.qty).toLocaleString()}</span>
    </div>`).join('');
  if (totalEl) totalEl.textContent = 'ETB ' + total.toLocaleString();
  const total2El = document.getElementById('checkoutSummaryTotal2');
  if (total2El) total2El.textContent = 'ETB ' + total.toLocaleString();
  if (btnEl)   btnEl.textContent   = `Place Order — ETB ${total.toLocaleString()}`;
}

let orderProcessing = false;
function submitOrder(e) {
  e.preventDefault();
  if (orderProcessing) return;
  orderProcessing = true;
  const btn = document.getElementById('placeOrderBtn');
  btn.textContent = 'Processing...';
  btn.disabled = true;
  setTimeout(() => {
    clearCart();
    orderProcessing = false;
    navigate('home');
    showToast('Order placed! We\'ll contact you with delivery details.');
  }, 1500);
}

/* ---------- Toast ---------- */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `position:fixed;bottom:2rem;right:2rem;background:var(--primary);color:var(--cream);
      padding:.85rem 1.5rem;border-radius:.5rem;font-size:.875rem;z-index:999;
      box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:opacity .3s;max-width:320px`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

/* ---------- Mobile Menu ---------- */
let menuOpen = false;
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', menuOpen);
  document.getElementById('hamburger').textContent = menuOpen ? '✕' : '☰';
}

/* ---------- Drag & Drop Upload ---------- */
function initUploadDrop() {
  const area = document.getElementById('uploadDropArea');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = 'var(--primary)'; });
  area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.style.borderColor = '';
    handleSellFiles(e.dataTransfer.files);
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  renderCart();
  navigate('home');
  initUploadDrop();
});
