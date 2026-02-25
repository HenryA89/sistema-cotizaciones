// Firebase removed
import supabase from "./supabaseClient.js";

export const createQuote = async (client, items, notes = "") => {
  if (!client?.id) throw new Error("Cliente inválido");
  if (!items || items.length === 0) throw new Error("Items requeridos");

  const subtotal = items.reduce(
    (acc, item) => acc + (item.precio || 0) * (item.cantidad || 1),
    0,
  );
  const impuestos = subtotal * 0.19; // 19% IVA Colombia
  const total = subtotal + impuestos;

  try {
    // Crear cotización
    const { data: cotizacion, error: cotizacionError } = await supabase
      .from("cotizaciones")
      .insert([
        {
          cliente_id: client.id,
          subtotal: subtotal,
          impuestos: impuestos,
          total: total,
        },
      ])
      .select()
      .single();

    if (cotizacionError) throw cotizacionError;
    if (!cotizacion) throw new Error("No se pudo crear la cotización");

    // Si hay notas, agregarlas
    if (notes?.trim()) {
      await supabase.from("notas").insert([
        {
          cliente_id: client.id,
          contenido: notes,
          tipo: "general",
        },
      ]);
    }

    // Agregar items a la cotización
    const cotizacionItems = items.map((item) => ({
      cotizacion_id: cotizacion.id,
      producto_id: item.id || null,
      cantidad: item.cantidad || 1,
      precio_unitario: item.precio || 0,
      subtotal: (item.precio || 0) * (item.cantidad || 1),
    }));

    if (cotizacionItems.length > 0) {
      const { error: itemsError } = await supabase
        .from("cotizacion_productos")
        .insert(cotizacionItems);
      if (itemsError) console.error("Error al agregar items:", itemsError);
    }

    return {
      ...cotizacion,
      items: items,
      client_name: `${client.nombres || ""} ${client.apellidos || ""}`,
    };
  } catch (err) {
    console.error("createQuote error", err);
    throw err;
  }
};

export const fetchQuoteDetails = async (quoteId) => {
  try {
    const { data: quote, error: quoteError } = await supabase
      .from("cotizaciones")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError) throw quoteError;

    const { data: items, error: itemsError } = await supabase
      .from("cotizacion_productos")
      .select("*, productos(*)")
      .eq("cotizacion_id", quoteId);

    if (itemsError) throw itemsError;

    return { ...quote, items: items || [] };
  } catch (err) {
    console.error("fetchQuoteDetails error", err);
    throw err;
  }
};
