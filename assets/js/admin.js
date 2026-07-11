// ============================================================================
//  URCO — Panel de administración
//  Login (Supabase Auth) + ABM de productos + subida de imágenes a Storage.
//  Los usuarios comunes NO tienen acceso: las políticas RLS del servidor
//  sólo permiten escribir a usuarios autenticados.
// ============================================================================
import { CATEGORIES, STORE } from "./data.js";
import { getClient, hasSupabase, rowToProduct, PLACEHOLDER } from "./store.js";

const app = document.getElementById("app");
const fmt = (n) => `${STORE.currency}${Number(n).toLocaleString("es-AR")}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slugify = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const BUCKET = "products";
let supabase = null;
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
    // Si sale bien, onAuthStateChange dispara route()
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
      <div class="admin-head">
        <h1>Productos</h1>
        <button class="btn btn-gold" id="new-btn">+ Nuevo cuchillo</button>
      </div>
      <div id="list" class="admin-list"><p class="muted">Cargando productos…</p></div>
    </main>
    <div id="editor"></div>`;

  document.getElementById("logout").addEventListener("click", () => supabase.auth.signOut());
  document.getElementById("new-btn").addEventListener("click", () => openEditor(null));
  await loadList();
}

async function loadList() {
  const list = document.getElementById("list");
  const { data, error } = await supabase.from("products").select("*")
    .order("sort_index", { ascending: true }).order("created_at", { ascending: true });
  if (error) { list.innerHTML = `<p class="form-error">Error al cargar: ${esc(error.message)}</p>`; return; }
  products = (data || []).map(rowToProduct);

  if (!products.length) {
    list.innerHTML = `<p class="muted">Todavía no hay productos. Creá el primero con “+ Nuevo cuchillo”.</p>`;
    return;
  }
  list.innerHTML = "";
  products.forEach((p) => {
    const cat = (CATEGORIES.find((c) => c.slug === p.category) || {}).name || p.category;
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
    row.querySelector("[data-edit]").addEventListener("click", () => openEditor(p));
    row.querySelector("[data-del]").addEventListener("click", () => removeProduct(p));
    list.appendChild(row);
  });
}

async function removeProduct(p) {
  if (!confirm(`¿Eliminar “${p.name}”? Esta acción no se puede deshacer.`)) return;
  const { error } = await supabase.from("products").delete().eq("id", p.id);
  if (error) return alert("No se pudo eliminar: " + error.message);
  await loadList();
}

/* ---------- Editor (crear / editar) ---------- */
function openEditor(p) {
  const isNew = !p;
  const data = p || { name: "", category: CATEGORIES[0].slug, price: "", discountedPrice: null, inStock: true, description: "", specs: {}, images: [] };
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
              <select id="f-cat">${CATEGORIES.map((c) => `<option value="${c.slug}" ${c.slug === data.category ? "selected" : ""}>${c.name}</option>`).join("")}</select>
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

  // Specs dinámicos
  editor.querySelector("#add-spec").addEventListener("click", () => {
    editor.querySelector("#specs").insertAdjacentHTML("beforeend", specRow(["", ""]));
    bindSpecRemovers();
  });
  bindSpecRemovers();
  function bindSpecRemovers() {
    editor.querySelectorAll("#specs .spec-del").forEach((b) => {
      b.onclick = () => b.closest(".spec-line").remove();
    });
  }

  // Manager de imágenes existentes (quitar)
  bindImgRemovers();
  function bindImgRemovers() {
    editor.querySelectorAll("#imgs .img-del").forEach((b) => {
      b.onclick = () => b.closest(".img-item").remove();
    });
  }

  // Guardar
  editor.querySelector("#prod-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errBox = editor.querySelector("#form-error");
    const saveBtn = editor.querySelector("#save-btn");
    errBox.hidden = true;
    saveBtn.disabled = true; saveBtn.textContent = "Guardando…";
    try {
      // 1) Imágenes existentes que se conservan (en orden)
      const kept = [...editor.querySelectorAll("#imgs .img-item")].map((n) => n.dataset.url);
      // 2) Subir nuevas
      const files = [...editor.querySelector("#f-files").files];
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadImage(file));
      const images = [...kept, ...uploaded];

      // 3) Specs
      const specs = {};
      editor.querySelectorAll("#specs .spec-line").forEach((line) => {
        const k = line.querySelector(".spec-k").value.trim();
        const v = line.querySelector(".spec-v").value.trim();
        if (k) specs[k] = v;
      });

      // 4) Armar registro
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
        record.slug = await uniqueSlug(slugify(name) || "cuchillo");
        record.sort_index = products.length + 1;
        const { error } = await supabase.from("products").insert(record);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(record).eq("id", p.id);
        if (error) throw error;
      }
      close();
      await loadList();
    } catch (err) {
      errBox.textContent = "No se pudo guardar: " + (err.message || err);
      errBox.hidden = false;
      saveBtn.disabled = false; saveBtn.textContent = isNew ? "Crear producto" : "Guardar cambios";
    }
  });
}

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
async function uniqueSlug(base) {
  let slug = base, i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${++i}`;
  }
}
