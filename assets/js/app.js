// ============================================================================
//  URCO — Lógica de la tienda (render + interacción)
// ============================================================================
import { STORE, CATEGORIES, PRODUCTS } from "./data.js";

const fmt = (n) => `${STORE.currency}${Number(n).toLocaleString("es-AR")}`;
const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
const waLink = (text) =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;

// ---------- Enlaces de contacto globales ----------
function wireContactLinks() {
  document.querySelectorAll("[data-wa-store]").forEach((a) => {
    a.href = waLink(`¡Hola ${STORE.name}! Quisiera hacer una consulta sobre sus cuchillos.`);
  });
  document.querySelectorAll("[data-ig]").forEach((a) => (a.href = STORE.instagram));
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

// ---------- Categorías ----------
function renderCategories() {
  const grid = document.getElementById("cat-grid");
  CATEGORIES.forEach((c) => {
    grid.appendChild(
      el(`
      <a class="cat-card" href="#${c.slug}">
        <img src="${c.image}" alt="${c.name}" loading="lazy" />
        <div class="cat-overlay">
          <h3>${c.name}</h3>
          <p>${c.blurb}</p>
        </div>
      </a>`)
    );
  });
}

// ---------- Catálogo agrupado por categoría ----------
function renderCatalog() {
  const root = document.getElementById("catalog");
  CATEGORIES.forEach((cat) => {
    const items = PRODUCTS.filter((p) => p.category === cat.slug);
    if (!items.length) return;

    const block = el(`
      <section class="cat-block" id="${cat.slug}">
        <div class="cat-block-head">
          <h2>${cat.name}</h2>
          <span>${items.length} ${items.length === 1 ? "producto" : "productos"}</span>
        </div>
        <div class="product-grid"></div>
      </section>`);

    const grid = block.querySelector(".product-grid");
    items.forEach((p) => grid.appendChild(productCard(p)));
    root.appendChild(block);
  });
}

function productCard(p) {
  const hasAlt = p.images.length > 1;
  const off =
    p.discountedPrice != null && p.discountedPrice < p.price;

  const card = el(`
    <article class="product-card" tabindex="0" role="button" aria-label="Ver ${p.name}">
      <div class="product-media">
        ${!p.inStock ? '<span class="badge badge-out">Sin stock</span>' : off ? '<span class="badge badge-off">Oferta</span>' : ""}
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy" />
        ${hasAlt ? `<img class="img-alt" src="${p.images[1]}" alt="" loading="lazy" />` : ""}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">${p.specs["Material de la hoja"] || ""}</div>
        <div class="product-price">
          <span class="price-now">${fmt(off ? p.discountedPrice : p.price)}</span>
          ${off ? `<span class="price-old">${fmt(p.price)}</span>` : ""}
        </div>
      </div>
    </article>`);

  const open = () => openModal(p);
  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
  return card;
}

// ---------- Modal de producto ----------
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");

function openModal(p) {
  const off = p.discountedPrice != null && p.discountedPrice < p.price;
  const specRows = Object.entries(p.specs)
    .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
    .join("");
  const thumbs = p.images.length > 1
    ? `<div class="modal-thumbs">${p.images
        .map((src, i) => `<img src="${src}" data-i="${i}" class="${i === 0 ? "active" : ""}" alt="" />`)
        .join("")}</div>`
    : "";

  const orderText = `¡Hola ${STORE.name}! Me interesa el cuchillo *${p.name}* (${fmt(off ? p.discountedPrice : p.price)}). ¿Está disponible?`;

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <div class="main-img"><img id="modal-main" src="${p.images[0]}" alt="${p.name}" /></div>
        ${thumbs}
      </div>
      <div class="modal-detail">
        <p class="modal-cat">${(CATEGORIES.find((c) => c.slug === p.category) || {}).name || ""}</p>
        <h2 id="modal-name">${p.name}</h2>
        <div class="modal-price">
          <span class="price-now">${fmt(off ? p.discountedPrice : p.price)}</span>
          ${off ? `<span class="price-old">${fmt(p.price)}</span>` : ""}
        </div>
        <p class="stock-line ${p.inStock ? "stock-in" : "stock-out"}">
          ${p.inStock ? "● Disponible" : "● Sin stock"}
        </p>
        <p class="modal-desc">${p.description}</p>
        <table class="spec-table"><tbody>${specRows}</tbody></table>
        <a class="btn btn-wa" href="${waLink(orderText)}" target="_blank" rel="noopener">
          ${p.inStock ? "Consultar por WhatsApp" : "Avisarme cuando esté"}
        </a>
      </div>
    </div>`;

  // galería
  const main = modalBody.querySelector("#modal-main");
  modalBody.querySelectorAll(".modal-thumbs img").forEach((t) => {
    t.addEventListener("click", () => {
      main.src = p.images[t.dataset.i];
      modalBody.querySelectorAll(".modal-thumbs img").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
    });
  });

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

// ---------- Init ----------
wireContactLinks();
renderCategories();
renderCatalog();
