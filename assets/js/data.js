// ============================================================================
//  URCO — Catálogo de productos
//  Datos extraídos y normalizados de la tienda original. Editable a mano:
//  agregá / quitá productos o categorías modificando este archivo.
// ============================================================================

// Marca y contacto. Reemplazá WHATSAPP por el número real (formato internacional,
// sólo dígitos, sin "+"). Ej: Argentina => 54911XXXXXXXX
export const STORE = {
  name: "URCO",
  tagline: "NOBLEZA DE ACERO",
  subtitle: "Desde la cocina hasta el monte, el filo que te acompaña siempre",
  currency: "AR$",
  whatsapp: "5491100000000",
  instagram: "https://instagram.com/",
};

export const CATEGORIES = [
  { slug: "cocina",     name: "COCINA",     icon: "chef",     image: "assets/img/cat-cocina.jpg",     blurb: "Precisión y rendimiento en cada corte." },
  { slug: "japones",    name: "JAPONES",    icon: "torii",    image: "assets/img/cat-japones.jpg",    blurb: "Tradición japonesa, filo impecable." },
  { slug: "aire-libre", name: "AIRE LIBRE", icon: "mountain", image: "assets/img/cat-aire-libre.jpg", blurb: "Hechos para cada aventura." },
];

// Barra de confianza / garantías
export const FEATURES = [
  { icon: "shield", title: "Acero de alta calidad" },
  { icon: "hammer", title: "Hechos a mano artesanales" },
  { icon: "truck",  title: "Envíos a todo el país" },
  { icon: "medal",  title: "Garantía de satisfacción" },
];

// price: precio de lista. discountedPrice: precio final si hay oferta (o null).
// inStock: disponibilidad. specs: ficha técnica.
export const PRODUCTS = [
  {
    slug: "cleaver",
    name: "CLEAVER",
    category: "cocina",
    price: 289,
    discountedPrice: null,
    inStock: true,
    images: ["assets/img/products/cleaver-1.jpg", "assets/img/products/cleaver-2.jpg"],
    description:
      "Hoja ancha de estilo híbrido y lomo inclinado, con acabado satinado. Estructura Full Tang que proporciona máxima resistencia estructural. Mango ergonómico de madera noble pulida, con curvatura hacia abajo del pomo para un mejor agarre. Talón pronunciado en el propio acero antes del filo, que protege los dedos contra cortes accidentales.",
    specs: { "Material de la hoja": "Acero Inox 420 MOB", "Material del mango": "Madera", "Largo de hoja": "5.5\"", "Largo total": "10.5\"" },
  },
  {
    slug: "santoku",
    name: "SANTOKU",
    category: "cocina",
    price: 195,
    discountedPrice: 155,
    inStock: true,
    images: ["assets/img/products/santoku-1.jpg"],
    description:
      "Su nombre significa \"tres virtudes\" o \"tres usos\", por su excelente desempeño con carne, pescado y vegetales. La punta \"pie de oveja\" lo hace más seguro y fácil de manejar para principiantes. Su perfil plano favorece el corte vertical o de empuje más que el balanceo tradicional. Ligero y equilibrado, reduce la fatiga en jornadas largas de cocina.",
    specs: { "Material de la hoja": "Acero Inox 420 MOB", "Material del mango": "Madera", "Largo de hoja": "5.5\"", "Largo total": "10.5\"" },
  },
  {
    slug: "kiritsuke",
    name: "KIRITSUKE",
    category: "japones",
    price: 189,
    discountedPrice: null,
    inStock: true,
    images: ["assets/img/products/kiritsuke-1.jpg", "assets/img/products/kiritsuke-2.jpg"],
    description:
      "Cuchillo con punta K-TIP, longitud 24 cm, acabado Tsuchime y doble bisel, que brinda la facilidad de uso de un cuchillo de chef normal. Versatilidad extrema: su largo permite filetear pescado con un solo movimiento, mientras que su altura permite picar vegetales con precisión y cortar carnes con facilidad.",
    specs: { "Material de la hoja": "Acero Inox 420 MOB", "Material del mango": "Madera y bronce", "Largo de hoja": "20 cm", "Largo total": "33 cm" },
  },
  {
    slug: "kiritsuke-con-saya",
    name: "KIRITSUKE CON SAYA",
    category: "japones",
    price: 249,
    discountedPrice: null,
    inStock: true,
    images: ["assets/img/products/kiritsuke-saya-1.jpg", "assets/img/products/kiritsuke-saya-2.jpg"],
    description:
      "El Kiritsuke de punta K-TIP y acabado Tsuchime, ahora acompañado de su Saya (鞘): una funda rígida de madera que aprieta la hoja sin rayarla. Incluye un pasador que traba el talón del cuchillo para garantizar que no se salga accidentalmente, ideal para el transporte y la protección del filo. Evita que la hoja choque con otros utensilios en el cajón, manteniéndola afilada por mucho más tiempo.",
    specs: { "Material de la hoja": "Acero Inox 420 MOB", "Material del mango": "Madera y bronce", "Incluye": "Saya de madera", "Largo total": "33 cm" },
  },
  {
    slug: "skinner",
    name: "SKINNER",
    category: "aire-libre",
    price: 180,
    discountedPrice: null,
    inStock: true,
    images: ["assets/img/products/skinner-1.jpg"],
    description:
      "Herramienta robusta orientada a las actividades al aire libre. Vientre curvo y pronunciado para cortes largos, fluidos y limpios; la punta se curva hacia arriba para trabajos de precisión en zonas estrechas. El lomo con rampa ofrece un punto de apoyo ideal para el pulgar, mejorando el control. Acabado satinado mate que reduce reflejos y disimula el uso rústico. Empuñadura Full Tang de máxima resistencia, con curvatura anatómica para un agarre firme incluso en condiciones de humedad.",
    specs: { "Material de la hoja": "Acero Inox 420 NG", "Material del mango": "Madera", "Largo de hoja": "6\"", "Largo total": "11\"" },
  },
  {
    slug: "bowie",
    name: "BOWIE",
    category: "aire-libre",
    price: 220,
    discountedPrice: null,
    inStock: false,
    images: ["assets/img/products/bowie-1.jpg"],
    description:
      "Clásico cuchillo Bowie de hoja robusta y punta clip point, pensado para tareas exigentes de campo y supervivencia. Estructura Full Tang y mango de madera noble para un agarre seguro y duradero.",
    specs: { "Material de la hoja": "Acero Inox 420", "Material del mango": "Madera", "Largo de hoja": "6\"", "Largo total": "11\"" },
  },
  {
    slug: "serpi",
    name: "SERPI",
    category: "aire-libre",
    price: 180,
    discountedPrice: null,
    inStock: true,
    images: ["assets/img/products/serpi-1.jpg", "assets/img/products/serpi-2.jpg"],
    description:
      "Diseño artesanal y táctico, extremadamente agresivo. Hoja de perfil curvo y ascendente (trailing point), ideal para cortes largos y precisos. Caída quebrada en el lomo que funciona como apoyo del pulgar y una pronunciada escotadura semicircular en la base para adelantar el índice y lograr máxima precisión cerca del filo. Espiga completa (Full Tang) con un llamativo liner azul brillante entre el acero y las cachas. Mango texturizado con agarre antideslizante excepcional, incluso con las manos mojadas.",
    specs: { "Material de la hoja": "Acero Inox 420 MOB", "Material del mango": "Madera texturizada", "Largo de hoja": "4\"", "Largo total": "9\"" },
  },
  {
    slug: "clip-point",
    name: "CLIP POINT",
    category: "aire-libre",
    price: 170,
    discountedPrice: null,
    inStock: true,
    images: ["assets/img/products/clip-point-1.jpg", "assets/img/products/clip-point-2.jpg"],
    description:
      "Cuchillo robusto y preciso, ideal para la vida al aire libre con la precisión de corte de la cocina. La hoja ensanchada al talón otorga una gran área de corte para cortes limpios por desplazamiento. Acabado superior Brute de Forge / texturizado. Cachas de resina epoxi trabajada con muy alta resistencia a la humedad. Mango con curvatura anatómica pronunciada que termina en un pomo ensanchado para evitar deslizamientos, y guarda integrada en la hoja para proteger los dedos.",
    specs: { "Material de la hoja": "Acero Inox 420 MOB", "Material del mango": "Resina epoxi", "Largo total": "10\"" },
  },
];
