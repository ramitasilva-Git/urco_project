// ============================================================================
//  URCO — Capa de datos
//  Lee los productos desde Supabase si está configurado; si no, usa el
//  catálogo estático de data.js (modo demo). El cliente de Supabase se carga
//  de forma diferida para no pesar cuando no se usa.
// ============================================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES } from "./data.js";

export const hasSupabase = () =>
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.startsWith("TU_") && !SUPABASE_ANON_KEY.startsWith("TU_");

// Imagen de reemplazo para productos sin foto
export const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231d1810'/%3E%3Ctext x='50%25' y='50%25' fill='%23a99a80' font-family='serif' font-size='30' letter-spacing='4' text-anchor='middle' dominant-baseline='middle'%3EURCO%3C/text%3E%3C/svg%3E";

let _client = null;
export async function getClient() {
  if (!hasSupabase()) return null;
  if (_client) return _client;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

// Normaliza una categoría de la base
export function rowToCategory(r) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    icon: r.icon || "blade",
    image: r.image || "",
    blurb: r.blurb || "",
  };
}

// Devuelve las categorías (Supabase o estáticas de fallback)
export async function loadCategories() {
  const client = await getClient();
  if (!client) return STATIC_CATEGORIES;
  try {
    const { data, error } = await client
      .from("categories")
      .select("*")
      .order("sort_index", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data && data.length ? data.map(rowToCategory) : STATIC_CATEGORIES;
  } catch (e) {
    console.warn("[URCO] No se pudieron cargar categorías, uso estáticas:", e.message);
    return STATIC_CATEGORIES;
  }
}

// Normaliza una fila de la base al formato que usa el frontend
export function rowToProduct(r) {
  return {
    id: r.id,
    slug: r.slug || r.id,
    name: r.name,
    category: r.category,
    price: Number(r.price) || 0,
    discountedPrice: r.discounted_price != null ? Number(r.discounted_price) : null,
    inStock: r.in_stock !== false,
    images: Array.isArray(r.images) ? r.images : [],
    description: r.description || "",
    specs: r.specs && typeof r.specs === "object" ? r.specs : {},
  };
}

// Devuelve el catálogo. Cae al estático si no hay config o si la tabla
// está vacía / falla, para que la tienda nunca quede en blanco.
export async function loadProducts() {
  const client = await getClient();
  if (!client) return STATIC_PRODUCTS;
  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("sort_index", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data && data.length ? data.map(rowToProduct) : STATIC_PRODUCTS;
  } catch (e) {
    console.warn("[URCO] No se pudo cargar desde Supabase, uso catálogo estático:", e.message);
    return STATIC_PRODUCTS;
  }
}
