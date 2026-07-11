// ============================================================================
//  URCO — Lógica de la tienda
//  Render + búsqueda + carrito (con checkout por WhatsApp) + modal
// ============================================================================
import { STORE, CATEGORIES, FEATURES, PRODUCTS } from "./data.js";

/* ---------- Helpers ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt = (n) => `${STORE.currency}${Number(n).toLocaleString("es-AR")}`;
const priceOf = (p) => (p.discountedPrice != null && p.discountedPrice < p.price ? p.discountedPrice : p.price);
const isOff = (p) => p.discountedPrice != null && p.discountedPrice < p.price;
const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
const waLink = (text) => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
const catName = (slug) => (CATEGORIES.find((c) => c.slug === slug) || {}).name || "";

/* ---------- Iconos (SVG) ---------- */
const ICONS = {
  chef: '<path d="M6 13.87A4 4 0 0 1 7.4 6a5.1 5.1 0 0 1 1.06-1.54 5 5 0 0 1 7.08 0A5.1 5.1 0 0 1 16.6 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/>',
  torii: '<path d="M3 7h18M4.5 10.5h15M7 7v12M17 7v12"/><path d="M3 7c2-3 16-3 18 0"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  hammer: '<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.9 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.9"/>',
  truck: '<path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/>',
  medal: '<circle cx="12" cy="9" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
};

/* ---------- Estado carrito ---------- */
const CART_KEY = "urco_cart";
let cart = load();
function load() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
}
function save() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

/* ---------- Enlaces de contacto ---------- */
function wireContact() {
  $$("[data-ig]").forEach((a) => (a.href = STORE.instagram));
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
}

/* ---------- Categorías ---------- */
function renderCategories() {
  const grid = $("#cat-grid");
  CATEGORIES.forEach((c) => {
    grid.appendChild(el(`
      <a class="cat-card" href="#${c.slug}">
        <img src="${c.image}" alt="${c.name}" loading="lazy" />
        <div class="cat-overlay">
          <div class="cat-ico"><svg class="ico" viewBox="0 0 24 24">${ICONS[c.icon] || ""}</svg></div>
          <h3>${c.name}</h3>
          <p>${c.blurb}</p>
        </div>
      </a>`));
  });
}

/* ---------- Barra de garantías ---------- */
function renderFeatures() {
  const grid = $("#feature-grid");
  FEATURES.forEach((f) => {
    grid.appendChild(el(`
      <div class="feature">
        <svg class="ico" viewBox="0 0 24 24">${ICONS[f.icon] || ""}</svg>
        <span>${f.title}</span>
      </div>`));
  });
}

/* ---------- Catálogo ---------- */
function renderCatalog(filter = "") {
  const root = $("#catalog");
  root.innerHTML = "";
  const q = filter.trim().toLowerCase();
  let total = 0;

  CATEGORIES.forEach((cat) => {
    const items = PRODUCTS.filter(
      (p) => p.category === cat.slug &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
    if (!items.length) return;
    total += items.length;

    const block = el(`
      <section class="cat-block" id="${cat.slug}">
        <div class="cat-block-head">
          <h3>${cat.name}</h3>
          <span class="line"></span>
          <span class="count">${items.length} ${items.length === 1 ? "pieza" : "piezas"}</span>
        </div>
        <div class="product-grid"></div>
      </section>`);
    const grid = $(".product-grid", block);
    items.forEach((p) => grid.appendChild(productCard(p)));
    root.appendChild(block);
  });

  $("#no-results").hidden = total > 0;
}

function productCard(p) {
  const alt = p.images.length > 1;
  const off = isOff(p);
  const card = el(`
    <article class="product-card" tabindex="0" role="button" aria-label="Ver ${p.name}">
      <div class="product-media">
        ${!p.inStock ? '<span class="badge badge-out">Sin stock</span>' : off ? '<span class="badge badge-off">Oferta</span>' : ""}
        <img class="img-main" src="${p.images[0]}" alt="${p.name}" loading="lazy" />
        ${alt ? `<img class="img-alt" src="${p.images[1]}" alt="" loading="lazy" />` : ""}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">${p.specs["Material de la hoja"] || ""}</div>
        <div class="product-foot">
          <div class="product-price">
            <span class="price-now">${fmt(priceOf(p))}</span>
            ${off ? `<span class="price-old">${fmt(p.price)}</span>` : ""}
          </div>
          <button class="add-btn ${p.inStock ? "" : "is-disabled"}" aria-label="Agregar ${p.name}" title="Agregar al carrito">+</button>
        </div>
      </div>
    </article>`);

  card.addEventListener("click", () => openModal(p));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(p); }
  });
  $(".add-btn", card).addEventListener("click", (e) => {
    e.stopPropagation();
    if (p.inStock) { addToCart(p.slug); openDrawer(); }
  });
  return card;
}

/* ---------- Modal ---------- */
const modal = $("#modal");
const modalBody = $("#modal-body");

function openModal(p) {
  const off = isOff(p);
  const specRows = Object.entries(p.specs).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("");
  const thumbs = p.images.length > 1
    ? `<div class="modal-thumbs">${p.images.map((s, i) => `<img src="${s}" data-i="${i}" class="${i === 0 ? "active" : ""}" alt="" />`).join("")}</div>`
    : "";

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <div class="main-img"><img id="modal-main" src="${p.images[0]}" alt="${p.name}" /></div>
        ${thumbs}
      </div>
      <div class="modal-detail">
        <p class="modal-cat">${catName(p.category)}</p>
        <h2 id="modal-name">${p.name}</h2>
        <div class="modal-price">
          <span class="price-now">${fmt(priceOf(p))}</span>
          ${off ? `<span class="price-old">${fmt(p.price)}</span>` : ""}
        </div>
        <p class="stock-line ${p.inStock ? "stock-in" : "stock-out"}">${p.inStock ? "● Disponible" : "● Sin stock"}</p>
        <p class="modal-desc">${p.description}</p>
        <table class="spec-table"><tbody>${specRows}</tbody></table>
        ${p.inStock
          ? `<button class="btn btn-gold btn-block" id="modal-add">Agregar al carrito</button>`
          : `<a class="btn btn-wa btn-block" href="${waLink(`¡Hola ${STORE.name}! Quiero que me avisen cuando el cuchillo *${p.name}* vuelva a tener stock.`)}" target="_blank" rel="noopener">Avisarme cuando esté</a>`}
      </div>
    </div>`;

  const main = $("#modal-main", modalBody);
  $$(".modal-thumbs img", modalBody).forEach((t) => {
    t.addEventListener("click", () => {
      main.src = p.images[t.dataset.i];
      $$(".modal-thumbs img", modalBody).forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
    });
  });
  const addBtn = $("#modal-add", modalBody);
  if (addBtn) addBtn.addEventListener("click", () => { addToCart(p.slug); closeModal(); openDrawer(); });

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() { modal.hidden = true; if ($("#drawer").hidden) document.body.style.overflow = ""; }
modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });

/* ---------- Carrito ---------- */
const drawer = $("#drawer");
function addToCart(slug) { cart[slug] = (cart[slug] || 0) + 1; save(); syncCart(); }
function setQty(slug, qty) {
  if (qty <= 0) delete cart[slug]; else cart[slug] = qty;
  save(); syncCart();
}
function cartEntries() {
  return Object.entries(cart)
    .map(([slug, qty]) => ({ p: PRODUCTS.find((x) => x.slug === slug), qty }))
    .filter((e) => e.p);
}
function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function cartTotal() { return cartEntries().reduce((a, e) => a + priceOf(e.p) * e.qty, 0); }

function syncCart() {
  const n = cartCount();
  const badge = $("#cart-count");
  badge.textContent = n; badge.hidden = n === 0;

  const box = $("#drawer-items");
  const entries = cartEntries();
  if (!entries.length) {
    box.innerHTML = `<p class="drawer-empty">Tu carrito está vacío.</p>`;
  } else {
    box.innerHTML = "";
    entries.forEach(({ p, qty }) => {
      const row = el(`
        <div class="cart-item">
          <img src="${p.images[0]}" alt="${p.name}" />
          <div class="ci-body">
            <div class="ci-name">${p.name}</div>
            <div class="ci-price">${fmt(priceOf(p))}</div>
            <div class="qty">
              <button data-dec aria-label="Restar">−</button>
              <span>${qty}</span>
              <button data-inc aria-label="Sumar">+</button>
            </div>
          </div>
          <button class="ci-remove" data-rm aria-label="Quitar">
            <svg class="ico" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>`);
      $("[data-dec]", row).addEventListener("click", () => setQty(p.slug, qty - 1));
      $("[data-inc]", row).addEventListener("click", () => setQty(p.slug, qty + 1));
      $("[data-rm]", row).addEventListener("click", () => setQty(p.slug, 0));
      box.appendChild(row);
    });
  }

  $("#cart-total").textContent = fmt(cartTotal());
  const checkout = $("#checkout-wa");
  if (!entries.length) {
    checkout.classList.add("is-disabled");
    checkout.removeAttribute("href");
  } else {
    checkout.classList.remove("is-disabled");
    const lines = entries.map(({ p, qty }) => `• ${qty}x ${p.name} — ${fmt(priceOf(p) * qty)}`).join("\n");
    checkout.href = waLink(`¡Hola ${STORE.name}! Quiero hacer este pedido:\n\n${lines}\n\n*Total: ${fmt(cartTotal())}*`);
  }
}
function openDrawer() { drawer.hidden = false; document.body.style.overflow = "hidden"; }
function closeDrawer() { drawer.hidden = true; if (modal.hidden) document.body.style.overflow = ""; }
$("#cart-btn").addEventListener("click", openDrawer);
drawer.addEventListener("click", (e) => { if (e.target.hasAttribute("data-cart-close")) closeDrawer(); });

/* ---------- Buscador ---------- */
let searchTimer;
$("#search").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderCatalog(e.target.value), 120);
});

/* ---------- Menú móvil ---------- */
const mnav = $("#mobile-nav");
$("#menu-btn").addEventListener("click", () => mnav.classList.toggle("open"));
$$("#mobile-nav a").forEach((a) => a.addEventListener("click", () => mnav.classList.remove("open")));

/* ---------- Cerrar con Escape ---------- */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!modal.hidden) closeModal();
  else if (!drawer.hidden) closeDrawer();
});

/* ---------- Init ---------- */
wireContact();
renderCategories();
renderFeatures();
renderCatalog();
syncCart();
