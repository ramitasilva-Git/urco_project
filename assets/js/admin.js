// ============================================================================
//  URCO — Panel de administración
//  Login (Supabase Auth) + ABM de categorías y productos + subida de imágenes.
//  Los usuarios comunes NO tienen acceso: las políticas RLS del servidor
//  sólo permiten escribir a usuarios autenticados.
// ============================================================================
import { STORE } from "./data.js";
import { getClient, hasSupabase, rowToProduct, rowToCategory, PLACEHOLDER } from "./store.js";
import { ICONS, PICKABLE_ICONS } from "./icons.js";

const app = document.getElementById("app");
const fmt = (n) => `${STORE.currency}${Number(n).toLocaleString("es-AR")}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slugify = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const svg = (key) => `<svg class="ico" viewBox="0 0 24 24">${ICONS[key] || ICONS.blade}</svg>`;

const BUCKET = "products";
let supabase = null;
let categories = [];
let products = [];

/* ---------- Arranque ---------- */
(async function boot() {
  if (!hasSupabase()) return renderSetupNotice();
  supabase = await getClient();
  supabase.auth.onAuthStateChange(() => route());
  route();
})();

async function route() {
  const { data } = await supabase.auth.getSession();
  if (data.session) renderDashboard();
  else renderLogin();
}

/* ---------- Vista: Supabase sin configurar ---------- */
function renderSetupNotice() {
  app.className = "";
  app.innerHTML = `
    <div class="admin-center">
      <div class="admin-card">
        <div class="admin-brand"><img src="assets/img/logo.jpg" alt="" /><span>URCO · Admin</span></div>
        <h2>Falta configurar Supabase</h2>
        <p class="muted">Editá <code>assets/js/config.js</code> con la URL y la <em>anon key</em> de tu
        proyecto, y seguí los pasos de <code>SETUP.md</code>. Después recargá esta página.</p>
        <a class="btn btn-ghost btn-block" href="index.html">← Volver a la tienda</a>
      </div>
    </div>`;
}

/* ---------- Vista: Login ---------- */
function renderLogin() {
  app.className = "";
  app.innerHTML = `
    <div class="admin-center">
      <form class="admin-card" id="login-form">
        <div class="admin-brand"><img src="assets/img/logo.jpg" alt="" /><span>URCO · Admin</span></div>
        <h2>Ingresá a tu cuenta</h2>
        <label class="fld"><span>Email</span><input type="email" id="email" required autocomplete="username" /></label>
        <label class="fld"><span>Contraseña</span><input type="password" id="password" required autocomplete="current-password" /></label>
        <p class="form-error" id="login-error" hidden></p>
        <button class="btn btn-gold btn-block" type="submit">Ingresar</button>
        <a class="admin-back" href="index.html">← Volver a la tienda</a>
      </form>
    </div>`;

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const errBox = document.getElementById("login-error");
    errBox.hidden = true;
    btn.disabled = true; btn.textContent = "Ingresando…";
    const { error } = await supabase.auth.signInWithPassword({
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
    });
    if (error) {
      errBox.textContent = "No pudimos ingresar: revisá el email y la contraseña.";
      errBox.hidden = false;
      btn.disabled = false; btn.textContent = "Ingresar";
    }
  });
}

/* ---------- Vista: Dashboard ---------- */
async function renderDashboard() {
  app.className = "";
  app.innerHTML = `
    <header class="admin-top">
      <div class="admin-brand"><img src="assets/img/logo.jpg" alt="" /><span>URCO · Admin</span></div>
      <div class="admin-actions">
        <a class="btn btn-ghost" href="index.html" target="_blank">Ver tienda ↗</a>
        <button class="btn btn-ghost" id="logout">Cerrar sesión</button>
      </div>
    </header>
    <main class="admin-main">
      <section class="admin-section">
        <div class="admin-head">
          <h1>Categorías</h1>
          <button class="btn btn-gold" id="new-cat">+ Nueva categoría</button>
        </div>
        <div id="cat-list" class="admin-list"><p class="muted">Cargando…</p></div>
      </section>

      <section class="admin-section">
        <div class="admin-head">
          <h1>Productos</h1>
          <button class="btn btn-gold" id="new-prod">+ Nuevo cuchillo</button>
        </div>
        <div id="prod-list" class="admin-list"><p class="muted">Cargando…</p></div>
      </section>
    </main>
    <div id="editor"></div>`;

  document.getElementById("logout").addEventListener("click", () => supabase.auth.signOut());
  document.getElementById("new-cat").addEventListener("click", () => openCatEditor(null));
  document.getElementById("new-prod").addEventListener("click", () => openProdEditor(null));
  await loadAll();
}

async function loadAll() {
  await Promise.all([loadCatList(), loadProdList()]);
}

/* ==========================================================================
   CATEGORÍAS
   ======================================================================== */
async function loadCatList() {
  const box = document.getElementById("cat-list");
  const { data, error } = await supabase.from("categories").select("*")
    .order("sort_index", { ascending: true }).order("created_at", { ascending: true });
  if (error) {
    categories = [];
    box.innerHTML = `<p class="form-error">Falta la tabla de categorías. Ejecutá <code>db/categories.sql</code> en el SQL Editor de Supabase y recargá.</p>`;
    return;
  }
  categories = (data || []).map(rowToCategory);
  if (!categories.length) {
    box.innerHTML = `<p class="muted">Todavía no hay categorías. Creá la primera con “+ Nueva categoría”.</p>`;
    return;
  }
  box.innerHTML = "";
  categories.forEach((c) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <img src="${c.image || PLACEHOLDER}" alt="" />
      <div class="ar-main">
        <div class="ar-name">${svg(c.icon)} ${esc(c.name)}</div>
        <div class="ar-meta">${esc(c.blurb || "")}</div>
      </div>
      <div class="ar-price"></div>
      <div class="ar-btns">
        <button class="btn btn-ghost sm" data-edit>Editar</button>
        <button class="btn btn-danger sm" data-del>Eliminar</button>
      </div>`;
    row.querySelector("[data-edit]").addEventListener("click", () => openCatEditor(c));
    row.querySelector("[data-del]").addEventListener("click", () => removeCategory(c));
    box.appendChild(row);
  });
}

async function removeCategory(c) {
  const inCat = products.filter((p) => p.category === c.slug).length;
  const warn = inCat ? `\n\nOJO: hay ${inCat} producto(s) en esta categoría y quedarán sin categoría visible.` : "";
  if (!confirm(`¿Eliminar la categoría “${c.name}”?${warn}`)) return;
  const { error } = await supabase.from("categories").delete().eq("id", c.id);
  if (error) return alert("No se pudo eliminar: " + error.message);
  await loadAll();
}

function openCatEditor(c) {
  const isNew = !c;
  const data = c || { name: "", icon: "blade", image: "", blurb: "" };
  const editor = document.getElementById("editor");

  editor.innerHTML = `
    <div class="modal" style="display:flex">
      <div class="modal-backdrop" data-x></div>
      <div class="modal-card admin-editor">
        <button class="modal-close" data-x aria-label="Cerrar">${svg("blade").replace(ICONS.blade, ICONS.blade)}<svg class="ico" viewBox="0 0 24 24" style="display:none"></svg></button>
        <form id="cat-form" class="admin-form">
          <h2>${isNew ? "Nueva categoría" : "Editar categoría"}</h2>

          <label class="fld"><span>Nombre *</span><input id="c-name" required value="${esc(data.name)}" placeholder="Ej: CAZA" /></label>

          <div class="fld">
            <span>Ícono</span>
            <div class="icon-picker" id="c-iconpick">
              ${PICKABLE_ICONS.map((k) => `<button type="button" class="icon-opt ${k === data.icon ? "sel" : ""}" data-icon="${k}" title="${k}">${svg(k)}</button>`).join("")}
            </div>
            <input type="hidden" id="c-icon" value="${esc(data.icon)}" />
          </div>

          <label class="fld"><span>Descripción corta</span><input id="c-blurb" value="${esc(data.blurb)}" placeholder="Ej: Para cada aventura." /></label>

          <div class="fld">
            <span>Imagen de la categoría</span>
            <div id="c-imgs" class="img-manager">${data.image ? imgThumb(data.image) : ""}</div>
            <input id="c-file" type="file" accept="image/*" />
          </div>

          <p class="form-error" id="cat-error" hidden></p>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" data-x>Cancelar</button>
            <button type="submit" class="btn btn-gold" id="cat-save">${isNew ? "Crear categoría" : "Guardar cambios"}</button>
          </div>
        </form>
      </div>
    </div>`;

  // Botón cerrar (icono X limpio)
  editor.querySelector(".modal-close").innerHTML = `<svg class="ico" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

  const close = () => (editor.innerHTML = "");
  editor.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", close));

  // Picker de íconos
  const iconInput = editor.querySelector("#c-icon");
  editor.querySelectorAll("#c-iconpick .icon-opt").forEach((b) => {
    b.addEventListener("click", () => {
      editor.querySelectorAll("#c-iconpick .icon-opt").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel");
      iconInput.value = b.dataset.icon;
    });
  });

  // Quitar imagen existente
  bindImgRemovers(editor, "#c-imgs");

  editor.querySelector("#cat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errBox = editor.querySelector("#cat-error");
    const saveBtn = editor.querySelector("#cat-save");
    errBox.hidden = true; saveBtn.disabled = true; saveBtn.textContent = "Guardando…";
    try {
      const kept = [...editor.querySelectorAll("#c-imgs .img-item")].map((n) => n.dataset.url);
      const file = editor.querySelector("#c-file").files[0];
      const image = file ? await uploadImage(file) : (kept[0] || "");
      const name = editor.querySelector("#c-name").value.trim();
      const record = {
        name,
        icon: iconInput.value || "blade",
        blurb: editor.querySelector("#c-blurb").value.trim(),
        image,
      };
      if (isNew) {
        record.slug = await uniqueSlug("categories", slugify(name) || "categoria");
        record.sort_index = categories.length + 1;
        const { error } = await supabase.from("categories").insert(record);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").update(record).eq("id", c.id);
        if (error) throw error;
      }
      close();
      await loadAll();
    } catch (err) {
      errBox.textContent = "No se pudo guardar: " + (err.message || err);
      errBox.hidden = false;
      saveBtn.disabled = false; saveBtn.textContent = isNew ? "Crear categoría" : "Guardar cambios";
    }
  });
}

/* ==========================================================================
   PRODUCTOS
   ======================================================================== */
async function loadProdList() {
  const box = document.getElementById("prod-list");
  const { data, error } = await supabase.from("products").select("*")
    .order("sort_index", { ascending: true }).order("created_at", { ascending: true });
  if (error) { box.innerHTML = `<p class="form-error">Error al cargar: ${esc(error.message)}</p>`; return; }
  products = (data || []).map(rowToProduct);

  if (!products.length) {
    box.innerHTML = `<p class="muted">Todavía no hay productos. Creá el primero con “+ Nuevo cuchillo”.</p>`;
    return;
  }
  box.innerHTML = "";
  products.forEach((p) => {
    const cat = (categories.find((c) => c.slug === p.category) || {}).name || p.category;
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <img src="${(p.images && p.images[0]) || PLACEHOLDER}" alt="" />
      <div class="ar-main">
        <div class="ar-name">${esc(p.name)}</div>
        <div class="ar-meta">${esc(cat)} · ${p.inStock ? "En stock" : "Sin stock"}</div>
      </div>
      <div class="ar-price">${fmt(p.discountedPrice ?? p.price)}${p.discountedPrice ? ` <s>${fmt(p.price)}</s>` : ""}</div>
      <div class="ar-btns">
        <button class="btn btn-ghost sm" data-edit>Editar</button>
        <button class="btn btn-danger sm" data-del>Eliminar</button>
      </div>`;
    row.querySelector("[data-edit]").addEventListener("click", () => openProdEditor(p));
    row.querySelector("[data-del]").addEventListener("click", () => removeProduct(p));
    box.appendChild(row);
  });
}

async function removeProduct(p) {
  if (!confirm(`¿Eliminar “${p.name}”? Esta acción no se puede deshacer.`)) return;
  const { error } = await supabase.from("products").delete().eq("id", p.id);
  if (error) return alert("No se pudo eliminar: " + error.message);
  await loadProdList();
}

function openProdEditor(p) {
  if (!categories.length) {
    alert("Primero creá al menos una categoría.");
    return;
  }
  const isNew = !p;
  const data = p || { name: "", category: categories[0].slug, price: "", discountedPrice: null, inStock: true, description: "", specs: {}, images: [] };
  const editor = document.getElementById("editor");
  const specRows = Object.entries(data.specs || {});

  editor.innerHTML = `
    <div class="modal" style="display:flex">
      <div class="modal-backdrop" data-x></div>
      <div class="modal-card admin-editor">
        <button class="modal-close" data-x aria-label="Cerrar">
          <svg class="ico" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <form id="prod-form" class="admin-form">
          <h2>${isNew ? "Nuevo cuchillo" : "Editar cuchillo"}</h2>

          <label class="fld"><span>Nombre *</span><input id="f-name" required value="${esc(data.name)}" /></label>

          <div class="fld-row">
            <label class="fld"><span>Categoría *</span>
              <select id="f-cat">${categories.map((c) => `<option value="${c.slug}" ${c.slug === data.category ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select>
            </label>
            <label class="fld"><span>Precio (${STORE.currency}) *</span><input id="f-price" type="number" min="0" step="0.01" required value="${data.price}" /></label>
            <label class="fld"><span>Precio oferta</span><input id="f-disc" type="number" min="0" step="0.01" value="${data.discountedPrice ?? ""}" placeholder="opcional" /></label>
          </div>

          <label class="chk"><input id="f-stock" type="checkbox" ${data.inStock ? "checked" : ""} /> <span>Disponible / en stock</span></label>

          <label class="fld"><span>Descripción</span><textarea id="f-desc" rows="5">${esc(data.description)}</textarea></label>

          <div class="fld">
            <span>Ficha técnica</span>
            <div id="specs">${specRows.map(specRow).join("")}</div>
            <button type="button" class="btn btn-ghost sm" id="add-spec">+ Agregar dato</button>
          </div>

          <div class="fld">
            <span>Imágenes</span>
            <div id="imgs" class="img-manager">${(data.images || []).map(imgThumb).join("")}</div>
            <input id="f-files" type="file" accept="image/*" multiple />
            <small class="muted">La primera imagen es la principal.</small>
          </div>

          <p class="form-error" id="form-error" hidden></p>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" data-x>Cancelar</button>
            <button type="submit" class="btn btn-gold" id="save-btn">${isNew ? "Crear producto" : "Guardar cambios"}</button>
          </div>
        </form>
      </div>
    </div>`;

  const close = () => (editor.innerHTML = "");
  editor.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", close));

  editor.querySelector("#add-spec").addEventListener("click", () => {
    editor.querySelector("#specs").insertAdjacentHTML("beforeend", specRow(["", ""]));
    bindSpecRemovers();
  });
  bindSpecRemovers();
  function bindSpecRemovers() {
    editor.querySelectorAll("#specs .spec-del").forEach((b) => { b.onclick = () => b.closest(".spec-line").remove(); });
  }
  bindImgRemovers(editor, "#imgs");

  editor.querySelector("#prod-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errBox = editor.querySelector("#form-error");
    const saveBtn = editor.querySelector("#save-btn");
    errBox.hidden = true; saveBtn.disabled = true; saveBtn.textContent = "Guardando…";
    try {
      const kept = [...editor.querySelectorAll("#imgs .img-item")].map((n) => n.dataset.url);
      const files = [...editor.querySelector("#f-files").files];
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadImage(file));
      const images = [...kept, ...uploaded];

      const specs = {};
      editor.querySelectorAll("#specs .spec-line").forEach((line) => {
        const k = line.querySelector(".spec-k").value.trim();
        const v = line.querySelector(".spec-v").value.trim();
        if (k) specs[k] = v;
      });

      const name = editor.querySelector("#f-name").value.trim();
      const discRaw = editor.querySelector("#f-disc").value;
      const record = {
        name,
        category: editor.querySelector("#f-cat").value,
        price: Number(editor.querySelector("#f-price").value),
        discounted_price: discRaw === "" ? null : Number(discRaw),
        in_stock: editor.querySelector("#f-stock").checked,
        description: editor.querySelector("#f-desc").value.trim(),
        specs,
        images,
      };

      if (isNew) {
        record.slug = await uniqueSlug("products", slugify(name) || "cuchillo");
        record.sort_index = products.length + 1;
        const { error } = await supabase.from("products").insert(record);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(record).eq("id", p.id);
        if (error) throw error;
      }
      close();
      await loadProdList();
    } catch (err) {
      errBox.textContent = "No se pudo guardar: " + (err.message || err);
      errBox.hidden = false;
      saveBtn.disabled = false; saveBtn.textContent = isNew ? "Crear producto" : "Guardar cambios";
    }
  });
}

/* ---------- Sub-render helpers ---------- */
function specRow([k, v]) {
  return `<div class="spec-line">
    <input class="spec-k" placeholder="Ej: Material de la hoja" value="${esc(k)}" />
    <input class="spec-v" placeholder="Ej: Acero Inox 420" value="${esc(v)}" />
    <button type="button" class="spec-del" aria-label="Quitar">×</button>
  </div>`;
}
function imgThumb(url) {
  return `<div class="img-item" data-url="${esc(url)}">
    <img src="${esc(url)}" alt="" />
    <button type="button" class="img-del" aria-label="Quitar imagen">×</button>
  </div>`;
}
function bindImgRemovers(editor, sel) {
  editor.querySelectorAll(`${sel} .img-del`).forEach((b) => {
    b.onclick = () => b.closest(".img-item").remove();
  });
}

/* ---------- Storage ---------- */
async function uploadImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600", upsert: false, contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error("subida de imagen: " + error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ---------- Slug único ---------- */
async function uniqueSlug(table, base) {
  let slug = base, i = 1;
  while (true) {
    const { data } = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${++i}`;
  }
}
