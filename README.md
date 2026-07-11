# URCO — Nobleza de Acero

Tienda web estática de **cuchillos artesanales de acero**. Es un desarrollo propio
(HTML + CSS + JavaScript, sin frameworks ni dependencias de build) inspirado en el
diseño y catálogo de la tienda original creada con Store.link, reconstruido como
código autónomo y editable.

## ✨ Características

- **Tema oscuro con acento bronce** (`#a1660d`), tipografías *Roboto Condensed* + *DM Sans*.
- **Hero** a pantalla con lema *"Nobleza de acero"*.
- **Menú de categorías**: Cocina, Japonés y Aire Libre.
- **Catálogo agrupado por categoría** con tarjetas de producto (imagen con hover,
  badges de *Oferta* / *Sin stock*, precio con descuento).
- **Modal de producto** con galería de imágenes, ficha técnica y botón de compra
  por **WhatsApp**.
- **100% responsive** (desktop / tablet / mobile).
- **Buscador** en vivo y **carrito** con checkout por WhatsApp.
- **Panel de administración** (`admin.html`) con **login**: el admin sube
  cuchillos, cambia precios/stock e imágenes; los visitantes sólo ven y piden.
- Funciona en **modo demo** con catálogo estático, o conectado a **Supabase**
  (base de datos + almacenamiento de imágenes + login) — ver [`SETUP.md`](SETUP.md).

## 📁 Estructura

```
urco_project/
├── index.html                # tienda pública
├── admin.html                # panel de administración (login)
├── assets/
│   ├── css/
│   │   ├── styles.css        # estilos y tema de la tienda
│   │   └── admin.css         # estilos del panel admin
│   ├── js/
│   │   ├── data.js           # marca, categorías y catálogo de demo (fallback)
│   │   ├── config.js         # claves de Supabase (URL + anon key)
│   │   ├── store.js          # capa de datos (Supabase o estático)
│   │   ├── app.js            # tienda pública: render e interacción
│   │   └── admin.js          # panel: login + ABM + subida de imágenes
│   └── img/
│       ├── hero.jpg, logo.jpg, cat-*.jpg
│       └── products/         # fotos de cada cuchillo
├── db/
│   ├── schema.sql            # tabla, permisos RLS y bucket de imágenes
│   └── seed.sql              # catálogo inicial (opcional)
├── SETUP.md                  # cómo conectar Supabase paso a paso
└── README.md
```

## 🔐 Admin vs. usuarios

- **Visitantes** (cualquiera con la URL): ven el catálogo y hacen el pedido por
  WhatsApp. **No pueden editar nada.**
- **Admin** (con login en `admin.html`): crea/edita/elimina cuchillos, cambia
  precios, ofertas, stock, descripciones y **sube imágenes**.

La separación se garantiza en el **servidor** (políticas RLS de Supabase), no en
el navegador. Configuración: [`SETUP.md`](SETUP.md).

## 🚀 Cómo ejecutar

Al usar módulos ES (`import`), servilo por HTTP (no abriendo el archivo con doble clic):

```bash
# con Python
python -m http.server 8000
# o con Node
npx serve .
```

Luego abrí <http://localhost:8000>.

## ⚙️ Personalización

Editá **`assets/js/data.js`**:

- `STORE.whatsapp` → número real en formato internacional sólo con dígitos
  (ej. Argentina: `54911XXXXXXXX`). Es el número al que llegan las consultas de compra.
- `STORE.instagram` → URL de tu perfil.
- `CATEGORIES` → agregá / quitá categorías.
- `PRODUCTS` → cada producto tiene `name`, `category`, `price`, `discountedPrice`
  (o `null`), `inStock`, `images`, `description` y `specs`.

Para agregar fotos, dejalas en `assets/img/products/` y referencialas en `images`.

## 🌐 Publicar en GitHub Pages

En **Settings → Pages** del repositorio, elegí la rama `main` y la carpeta raíz `/`.
El sitio queda disponible en `https://ramitasilva-git.github.io/urco_project/`.

---

Catálogo: 8 cuchillos en 3 categorías (Cocina · Japonés · Aire Libre).
