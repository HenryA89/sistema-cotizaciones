import supabase from "./supabaseClient.js";

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getNoteContent = (note) => note?.contenido || note?.texto || "";

export const resolveClientId = (explicitClientId = null) => {
  if (explicitClientId) return String(explicitClientId);

  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("clienteId");
  if (fromUrl) return fromUrl;

  const fromStorage = localStorage.getItem("selectedClientId");
  return fromStorage || "";
};

export const getClientById = async (clientId) => {
  if (!clientId) return null;

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error) throw error;
  return data || null;
};

const fetchDistributorPriceRows = async () => {
  const attempts = [
    { column: "tipo_precio", value: "distribuidor" },
    { column: "tipo", value: "distribuidor" },
  ];

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from("precios_producto")
      .select("*")
      .eq(attempt.column, attempt.value);

    if (!error && Array.isArray(data)) {
      return data;
    }
  }

  const { data, error } = await supabase.from("precios_producto").select("*");
  if (error) throw error;

  return (data || []).filter(
    (row) => row?.tipo_precio === "distribuidor" || row?.tipo === "distribuidor",
  );
};

export const getDistributorPrices = async () => {
  const rows = await fetchDistributorPriceRows();
  console.log("Filas obtenidas de precios_producto:", rows);
  const pricesMap = {};

  for (const row of rows) {
    const productId = row?.producto_id ?? row?.product_id ?? row?.id_producto;
    const price =
      toNumber(row?.precio_distribuidor) ??
      toNumber(row?.precio_unitario) ??
      toNumber(row?.precio) ??
      toNumber(row?.valor);

    if (!productId || price === null) continue;
    pricesMap[String(productId)] = price;
    console.log(`Precio distribuidor para producto ${productId}: ${price}`);
  }

  console.log("Mapa de precios distribuidor:", pricesMap);
  return pricesMap;
};

export const getClientDiagnosis = async (clientId) => {
  if (!clientId) return { diagnostico1: "", diagnostico2: "" };

  const { data, error } = await supabase
    .from("notas")
    .select("id, tipo, contenido, texto, created_at")
    .eq("cliente_id", clientId)
    .in("tipo", ["diagnostico_1", "diagnostico_2", "nota1", "nota2"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  const notes = data || [];

  const diag1 =
    getNoteContent(notes.find((note) => note.tipo === "diagnostico_1")) ||
    getNoteContent(notes.find((note) => note.tipo === "nota1"));

  const diag2 =
    getNoteContent(notes.find((note) => note.tipo === "diagnostico_2")) ||
    getNoteContent(notes.find((note) => note.tipo === "nota2"));

  return {
    diagnostico1: diag1,
    diagnostico2: diag2,
  };
};

export const saveDiagnosisNote = async ({ clientId, type, content }) => {
  const cleanClientId = normalizeText(clientId);
  const cleanContent = normalizeText(content);

  if (!cleanClientId) throw new Error("Cliente no seleccionado");
  if (!cleanContent) throw new Error("Contenido de diagn�stico vac�o");

  const { data: existing, error: readError } = await supabase
    .from("notas")
    .select("id")
    .eq("cliente_id", cleanClientId)
    .eq("tipo", type)
    .order("created_at", { ascending: false })
    .limit(1);

  if (readError) throw readError;

  const existingNote = existing?.[0];

  if (existingNote?.id) {
    const { data, error } = await supabase
      .from("notas")
      .update({
        contenido: cleanContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingNote.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("notas")
    .insert([
      {
        cliente_id: cleanClientId,
        tipo: type,
        contenido: cleanContent,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
