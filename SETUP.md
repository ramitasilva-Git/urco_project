# Configurar el panel de administración (Supabase)

El sitio funciona en **modo demo** (catálogo estático) sin configurar nada. Para
que el **admin** pueda subir cuchillos, cambiar precios/stock e imágenes —y que
esos cambios los vean todos los visitantes— hay que conectar **Supabase** (gratis).

> 🔒 Seguridad: la *anon key* es pública y es seguro exponerla. Lo que impide que
> un usuario común edite son las **políticas RLS** del servidor: sólo un usuario
> **autenticado** (el admin logueado) puede escribir. Nunca dependas de una
> contraseña puesta en el JavaScript.

## Paso a paso

### 1. Crear el proyecto
1. Entrá a <https://supabase.com> → **New project** (elegí nombre y contraseña de base).
2. Esperá 1–2 minutos a que termine de crearse.

### 2. Crear la base de datos
1. En el menú lateral: **SQL Editor → New query**.
2. Pegá y ejecutá **todo** el contenido de [`db/schema.sql`](db/schema.sql) → **Run**.
3. (Opcional) Para cargar los 8 cuchillos de la demo, ejecutá también
   [`db/seed.sql`](db/seed.sql).

Esto crea la tabla `products`, las reglas de permisos y el bucket de imágenes `products`.

### 3. Crear el usuario admin
1. Menú lateral: **Authentication → Users → Add user → Create new user**.
2. Poné el **email** y **contraseña** que usará el administrador. Marcá
   *Auto Confirm User* si aparece.
3. (Recomendado) En **Authentication → Providers → Email**, **desactivá**
   *"Allow new users to sign up"* para que nadie más pueda registrarse.

### 4. Copiar las claves al sitio
1. Menú lateral: **Project Settings → API**.
2. Copiá **Project URL** y **anon public key**.
3. Pegalas en [`assets/js/config.js`](assets/js/config.js):
   ```js
   export const SUPABASE_URL = "https://xxxxx.supabase.co";
   export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

### 5. Usar el panel
- Tienda pública: `index.html`
- Panel admin: `admin.html` → ingresás con el email/contraseña del paso 3.

Desde el panel podés **crear/editar/eliminar** cuchillos, cambiar precios,
ofertas, stock, descripción, ficha técnica y **subir imágenes** (se guardan en
Supabase Storage). Los visitantes de la tienda sólo ven y hacen el pedido por
WhatsApp: no pueden editar nada.

## Notas
- El nº de WhatsApp de los pedidos se configura en `assets/js/data.js` (`STORE.whatsapp`).
- Las categorías (Cocina · Japonés · Aire Libre) están definidas en `assets/js/data.js`.
- Si publicás en GitHub Pages, la *anon key* quedará visible en el JS: es lo
  esperado y seguro gracias a RLS.
