const products = [
  {id:1,name:"The Sunday Mug",category:"Home",price:24,tag:"Bestseller",description:"A generous, hand-feel ceramic mug for slow coffee and long conversations.",art:"mug",color:"#e7dfd1"},
  {id:2,name:"Soft Glow Lamp",category:"Home",price:89,tag:"New arrival",description:"Warm, ambient light with a sculptural silhouette that feels at home anywhere.",art:"lamp",color:"#e5dfd2"},
  {id:3,name:"Forma Stoneware Vase",category:"Home",price:46,tag:"",description:"A quietly sculptural vase made for fresh stems, dried branches, or standing beautifully alone.",art:"vase",color:"#e9e4da"},
  {id:4,name:"Everyday Bottle",category:"Lifestyle",price:32,tag:"Everyday favourite",description:"A reusable bottle with a soft matte finish, made to go wherever the day takes you.",art:"bottle",color:"#e0e1d5"},
  {id:5,name:"Market Day Tote",category:"Accessories",price:38,tag:"",description:"A roomy, sturdy carryall for market finds, books, and the little extras.",art:"bag",color:"#e9e1d4"},
  {id:6,name:"The Daily Journal",category:"Lifestyle",price:19,tag:"",description:"A simple, tactile notebook for plans, passing thoughts, and fresh starts.",art:"notebook",color:"#e2e2d6"},
  {id:7,name:"Quiet Moment Candle",category:"Home",price:28,tag:"Small ritual",description:"A soft, comforting glow to help mark the end of a busy day.",art:"candle",color:"#eee5d7"},
  {id:8,name:"Little Things Tray",category:"Accessories",price:26,tag:"",description:"A catch-all for rings, keys, and all the small things that deserve a place.",art:"tray",color:"#e4e1d6"}
];

const grid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const cartItemsNode = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const toast = document.querySelector("#toast");
let activeCategory = "All";
let cart = [];
let toastTimer;

function artMarkup(product, extraClass = "") {
  return `<div class="product-art ${extraClass}" style="background:${product.color}"><div class="shape art-${product.art}"></div>${product.art === "lamp" ? '<div class="shape art-lamp-stem"></div><div class="shape art-lamp-base"></div>' : ""}</div>`;
}
function money(amount) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(amount); }

function visibleProducts() {
  let list = products.filter(p => activeCategory === "All" || p.category === activeCategory);
  const sort = document.querySelector("#sort-select").value;
  if (sort === "low") list.sort((a,b) => a.price-b.price);
  if (sort === "high") list.sort((a,b) => b.price-a.price);
  return list;
}
function renderProducts() {
  const list = visibleProducts();
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-visual" data-quick-view="${p.id}" tabindex="0" role="button" aria-label="Quick view ${p.name}">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
        ${artMarkup(p)}
        <button class="quick-button" data-quick-view="${p.id}">Quick view +</button>
      </div>
      <div class="product-meta">
        <div><h3 class="product-name">${p.name}</h3><p class="product-category">${p.category}</p></div>
        <div class="product-info-right"><span class="product-price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div>
      </div>
    </article>`).join("");
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function addToCart(id) {
  const product = products.find(p => p.id === Number(id));
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({...product, qty:1});
  renderCart();
  showToast(`${product.name} added to your bag`);
}
function changeQty(id, delta) {
  const item = cart.find(p => p.id === Number(id));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(p => p.id !== Number(id));
  renderCart();
}
function renderCart() {
  const count = cart.reduce((sum,item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum,item) => sum + item.price * item.qty, 0);
  document.querySelector(".cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  document.querySelector("#cart-subtotal").textContent = money(subtotal);
  cartEmpty.hidden = count > 0;
  cartFooter.hidden = count === 0;
  cartItemsNode.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-thumb">${artMarkup(item)}</div>
      <div><h3>${item.name}</h3><p>${item.category}</p>
        <div class="qty-controls"><button data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button></div>
        <button class="remove-item" data-remove="${item.id}">Remove</button>
      </div>
      <span class="cart-item-price">${money(item.price * item.qty)}</span>
    </div>`).join("");
}
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
function openQuickView(id) {
  const p = products.find(item => item.id === Number(id));
  if (!p) return;
  document.querySelector("#quick-view-content").innerHTML = `
    <div class="quick-view-content">
      <div class="quick-art">${artMarkup(p)}</div>
      <div class="quick-details"><p class="eyebrow">${p.category.toUpperCase()} · FORMA OBJECTS</p><h2>${p.name}</h2><div class="quick-price">${money(p.price)}</div><p>${p.description}</p><p>Designed for daily use. Simple forms, thoughtful details, and a little more joy in the everyday.</p><button class="button button-dark" data-add="${p.id}">Add to bag <span>＋</span></button></div>
    </div>`;
  document.querySelector("#quick-view").showModal();
}
document.querySelector("#quick-view").addEventListener("click", event => {
  if (event.target === event.currentTarget || event.target.closest(".quick-close")) event.currentTarget.close();
});
grid.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const quick = event.target.closest("[data-quick-view]");
  if (add) addToCart(add.dataset.add);
  else if (quick) openQuickView(quick.dataset.quickView);
});
grid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-quick-view]")) {
    event.preventDefault(); openQuickView(event.target.dataset.quickView);
  }
});
document.querySelector("#quick-view").addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  if (add) { addToCart(add.dataset.add); document.querySelector("#quick-view").close(); }
});
document.querySelector(".cart-toggle").addEventListener("click", openCart);
document.querySelector(".close-drawer").addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
cartItemsNode.addEventListener("click", event => {
  const qty = event.target.closest("[data-qty]");
  const remove = event.target.closest("[data-remove]");
  if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.delta));
  if (remove) { cart = cart.filter(item => item.id !== Number(remove.dataset.remove)); renderCart(); }
});
document.querySelectorAll(".filter-pill").forEach(button => button.addEventListener("click", () => {
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-pill").forEach(pill => pill.classList.toggle("active", pill === button));
  renderProducts();
}));
document.querySelector("#sort-select").addEventListener("change", renderProducts);
document.querySelector(".checkout-button").addEventListener("click", () => showToast("Demo storefront: checkout is not connected yet."));
document.querySelector("#newsletter-form").addEventListener("submit", event => {
  event.preventDefault();
  const email = document.querySelector("#email-input").value.trim();
  document.querySelector("#newsletter-message").textContent = `Thanks! ${email} is on the sample list.`;
  event.currentTarget.reset();
});
document.querySelector(".search-toggle").addEventListener("click", () => {
  const term = prompt("Search products by name or category:");
  if (term === null) return;
  const query = term.trim().toLowerCase();
  if (!query) { activeCategory = "All"; }
  else {
    const matches = products.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query));
    grid.innerHTML = matches.length ? matches.map(p => `
      <article class="product-card"><div class="product-visual" data-quick-view="${p.id}" tabindex="0" role="button" aria-label="Quick view ${p.name}">${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}${artMarkup(p)}<button class="quick-button" data-quick-view="${p.id}">Quick view +</button></div><div class="product-meta"><div><h3 class="product-name">${p.name}</h3><p class="product-category">${p.category}</p></div><div class="product-info-right"><span class="product-price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div></div></article>`).join("") : '<p>No products found. Try another search.</p>';
    document.querySelector("#shop").scrollIntoView({behavior:"smooth"});
    return;
  }
  document.querySelectorAll(".filter-pill").forEach(pill => pill.classList.toggle("active", pill.dataset.category === activeCategory));
  renderProducts();
  document.querySelector("#shop").scrollIntoView({behavior:"smooth"});
});
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".main-nav").classList.toggle("open");
});
document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => document.querySelector(".main-nav").classList.remove("open")));
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

renderProducts();
renderCart();
