-- ============================================================================
--  URCO · Catálogo inicial (opcional)
--  Ejecutá este archivo DESPUÉS de schema.sql para cargar los 8 cuchillos que
--  ya venían en la demo. Podés borrarlos o editarlos luego desde /admin.
--  Las imágenes apuntan a los archivos del repo (assets/img/products/...).
-- ============================================================================

insert into public.products (slug, name, category, price, discounted_price, in_stock, description, specs, images, sort_index) values
('cleaver', 'CLEAVER', 'cocina', 289, null, true,
 'Hoja ancha de estilo híbrido y lomo inclinado, con acabado satinado. Estructura Full Tang que proporciona máxima resistencia estructural. Mango ergonómico de madera noble pulida, con curvatura hacia abajo del pomo para un mejor agarre. Talón pronunciado en el propio acero antes del filo, que protege los dedos contra cortes accidentales.',
 '{"Material de la hoja":"Acero Inox 420 MOB","Material del mango":"Madera","Largo de hoja":"5.5\"","Largo total":"10.5\""}'::jsonb,
 '["assets/img/products/cleaver-1.jpg","assets/img/products/cleaver-2.jpg"]'::jsonb, 1),

('santoku', 'SANTOKU', 'cocina', 195, 155, true,
 'Su nombre significa "tres virtudes" o "tres usos", por su excelente desempeño con carne, pescado y vegetales. La punta "pie de oveja" lo hace más seguro y fácil de manejar para principiantes. Su perfil plano favorece el corte vertical o de empuje. Ligero y equilibrado, reduce la fatiga en jornadas largas de cocina.',
 '{"Material de la hoja":"Acero Inox 420 MOB","Material del mango":"Madera","Largo de hoja":"5.5\"","Largo total":"10.5\""}'::jsonb,
 '["assets/img/products/santoku-1.jpg"]'::jsonb, 2),

('kiritsuke', 'KIRITSUKE', 'japones', 189, null, true,
 'Cuchillo con punta K-TIP, longitud 24 cm, acabado Tsuchime y doble bisel, que brinda la facilidad de uso de un cuchillo de chef normal. Versatilidad extrema: su largo permite filetear pescado con un solo movimiento, mientras que su altura permite picar vegetales con precisión y cortar carnes con facilidad.',
 '{"Material de la hoja":"Acero Inox 420 MOB","Material del mango":"Madera y bronce","Largo de hoja":"20 cm","Largo total":"33 cm"}'::jsonb,
 '["assets/img/products/kiritsuke-1.jpg","assets/img/products/kiritsuke-2.jpg"]'::jsonb, 3),

('kiritsuke-con-saya', 'KIRITSUKE CON SAYA', 'japones', 249, null, true,
 'El Kiritsuke de punta K-TIP y acabado Tsuchime, ahora acompañado de su Saya: una funda rígida de madera que aprieta la hoja sin rayarla. Incluye un pasador que traba el talón del cuchillo para que no se salga accidentalmente, ideal para el transporte y la protección del filo.',
 '{"Material de la hoja":"Acero Inox 420 MOB","Material del mango":"Madera y bronce","Incluye":"Saya de madera","Largo total":"33 cm"}'::jsonb,
 '["assets/img/products/kiritsuke-saya-1.jpg","assets/img/products/kiritsuke-saya-2.jpg"]'::jsonb, 4),

('skinner', 'SKINNER', 'aire-libre', 180, null, true,
 'Herramienta robusta orientada a las actividades al aire libre. Vientre curvo y pronunciado para cortes largos y limpios; la punta se curva hacia arriba para trabajos de precisión. El lomo con rampa ofrece apoyo para el pulgar. Acabado satinado mate. Empuñadura Full Tang de máxima resistencia, con curvatura anatómica para un agarre firme incluso con humedad.',
 '{"Material de la hoja":"Acero Inox 420 NG","Material del mango":"Madera","Largo de hoja":"6\"","Largo total":"11\""}'::jsonb,
 '["assets/img/products/skinner-1.jpg"]'::jsonb, 5),

('bowie', 'BOWIE', 'aire-libre', 220, null, false,
 'Clásico cuchillo Bowie de hoja robusta y punta clip point, pensado para tareas exigentes de campo y supervivencia. Estructura Full Tang y mango de madera noble para un agarre seguro y duradero.',
 '{"Material de la hoja":"Acero Inox 420","Material del mango":"Madera","Largo de hoja":"6\"","Largo total":"11\""}'::jsonb,
 '["assets/img/products/bowie-1.jpg"]'::jsonb, 6),

('serpi', 'SERPI', 'aire-libre', 180, null, true,
 'Diseño artesanal y táctico, extremadamente agresivo. Hoja de perfil curvo y ascendente (trailing point), ideal para cortes largos y precisos. Escotadura semicircular en la base para adelantar el índice y lograr máxima precisión. Espiga completa (Full Tang) con liner azul brillante. Mango texturizado con agarre antideslizante excepcional.',
 '{"Material de la hoja":"Acero Inox 420 MOB","Material del mango":"Madera texturizada","Largo de hoja":"4\"","Largo total":"9\""}'::jsonb,
 '["assets/img/products/serpi-1.jpg","assets/img/products/serpi-2.jpg"]'::jsonb, 7),

('clip-point', 'CLIP POINT', 'aire-libre', 170, null, true,
 'Cuchillo robusto y preciso, ideal para la vida al aire libre con la precisión de corte de la cocina. La hoja ensanchada al talón otorga una gran área de corte. Acabado Brute de Forge / texturizado. Cachas de resina epoxi con alta resistencia a la humedad. Mango con curvatura anatómica y guarda integrada para proteger los dedos.',
 '{"Material de la hoja":"Acero Inox 420 MOB","Material del mango":"Resina epoxi","Largo total":"10\""}'::jsonb,
 '["assets/img/products/clip-point-1.jpg","assets/img/products/clip-point-2.jpg"]'::jsonb, 8)
on conflict (slug) do nothing;
