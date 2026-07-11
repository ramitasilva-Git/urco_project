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
- **Sin backend**: todo el catálogo vive en un único archivo de datos.

## 📁 Estructura

```
urco_project/
├── index.html
├── assets/
│   ├── css/styles.css        # estilos y tema
│   ├── js/
│   │   ├── data.js           # catálogo, categorías y datos de la tienda
│   │   └── app.js            # render e interacción
│   └── img/
│       ├── hero.jpg, logo.jpg, cat-*.jpg
│       └── products/         # fotos de cada cuchillo
└── README.md
```

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
