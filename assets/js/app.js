// ============================================================================
//  URCO — Lógica de la tienda (público)
//  Render + búsqueda + carrito (checkout por WhatsApp) + modal.
//  Los productos se cargan desde Supabase (o el catálogo estático de demo).
// ============================================================================
import { STORE, FEATURES } from "./data.js";
import { loadProducts, loadCategories, PLACEHOLDER } from "./store.js";
import { ICONS } from "./icons.js";

/* ---------- Helpers ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt = (n) => `${STORE.currency}${Number(n).toLocaleString("es-AR")}`;
const priceOf = (p) => (p.discountedPrice != null && p.discountedPrice < p.price ? p.discountedPrice : p.price);
const isOff = (p) => p.discountedPrice != null && p.discountedPrice < p.price;
const imgOf = (p, i = 0) => (p.images && p.images[i]) || PLACEHOLDER;
const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
const waLink = (text) => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
const catName = (slug) => (CATS.find((c) => c.slug === slug) || {}).name || "";

/* ---------- Datos (cargados async) ---------- */
let CATS = [];
let CATALOG = [];
let BY_SLUG = new Map();

/* ---------- Estado carrito ---------- */
const CART_KEY = "urco_cart";
let cart = load();
function load() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
function save() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

/* ---------- Contacto ---------- */
function wireContact() {
  $$("[data-ig]").forEach((a) => (a.href = STORE.instagram));
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
}

/* ---------- Categorías ---------- */
function renderCategories() {
  const grid = $("#cat-grid");
  grid.innerHTML = "";
  CATS.forEach((c) => {
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

  CATS.forEach((cat) => {
    const items = CATALOG.filter(
      (p) => p.category === cat.slug &&
        (!q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
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
  const alt = p.images && p.images.length > 1;
  const off = isOff(p);
  const card = el(`
    <article class="product-card" tabindex="0" role="button" aria-label="Ver ${p.name}">
      <div class="product-media">
        ${!p.inStock ? '<span class="badge badge-out">Sin stock</span>' : off ? '<span class="badge badge-off">Oferta</span>' : ""}
        <img class="img-main" src="${imgOf(p, 0)}" alt="${p.name}" loading="lazy" />
        ${alt ? `<img class="img-alt" src="${imgOf(p, 1)}" alt="" loading="lazy" />` : ""}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">${(p.specs && p.specs["Material de la hoja"]) || ""}</div>
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
  const specRows = Object.entries(p.specs || {}).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("");
  const imgs = p.images && p.images.length ? p.images : [PLACEHOLDER];
  const thumbs = imgs.length > 1
    ? `<div class="modal-thumbs">${imgs.map((s, i) => `<img src="${s}" data-i="${i}" class="${i === 0 ? "active" : ""}" alt="" />`).join("")}</div>`
    : "";

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <div class="main-img"><img id="modal-main" src="${imgs[0]}" alt="${p.name}" /></div>
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
        <p class="modal-desc">${(p.description || "").replace(/\n/g, "<br>")}</p>
        ${specRows ? `<table class="spec-table"><tbody>${specRows}</tbody></table>` : ""}
        ${p.inStock
          ? `<button class="btn btn-gold btn-block" id="modal-add">Agregar al carrito</button>`
          : `<a class="btn btn-wa btn-block" href="${waLink(`¡Hola ${STORE.name}! Quiero que me avisen cuando el cuchillo *${p.name}* vuelva a tener stock.`)}" target="_blank" rel="noopener">Avisarme cuando esté</a>`}
      </div>
    </div>`;

  const main = $("#modal-main", modalBody);
  $$(".modal-thumbs img", modalBody).forEach((t) => {
    t.addEventListener("click", () => {
      main.src = imgs[t.dataset.i];
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
function setQty(slug, qty) { if (qty <= 0) delete cart[slug]; else cart[slug] = qty; save(); syncCart(); }
function cartEntries() {
  return Object.entries(cart)
    .map(([slug, qty]) => ({ p: BY_SLUG.get(slug), qty }))
    .filter((e) => e.p);
}
function cartCount() { return cartEntries().reduce((a, e) => a + e.qty, 0); }
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
          <img src="${imgOf(p, 0)}" alt="${p.name}" />
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

/* ---------- Escape cierra ---------- */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!modal.hidden) closeModal();
  else if (!drawer.hidden) closeDrawer();
});

/* ---------- Init ---------- */
async function init() {
  wireContact();
  renderFeatures();
  [CATS, CATALOG] = await Promise.all([loadCategories(), loadProducts()]);
  BY_SLUG = new Map(CATALOG.map((p) => [p.slug, p]));
  renderCategories();
  renderCatalog();
  syncCart();
}
init();
