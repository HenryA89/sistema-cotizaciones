/**
 * Servicio para registración de clientes
 * Maneja la lógica de creación y transformación de datos
 */

export const createClientFromFormData = (formData) => {
  return {
    nombres: formData.nombres?.trim() || "",
    apellidos: formData.apellidos?.trim() || "",
    telefono: formData.telefono?.trim() || "",
    email: formData.email?.trim() || "",
    ciudad: formData.ciudad?.trim() || "",
    pais: formData.pais?.trim() || "",
    empresa_nombre: formData.empresaNombre?.trim() || "",
    empresa_direccion: formData.empresaDireccion?.trim() || "",
    empresa_actividad: formData.empresaActividad?.trim() || "",
    foto_url: formData.fotoUrl || null,
  };
};

export const validateClientData = (formData) => {
  const errors = {};

  if (!formData.nombres?.trim()) errors.nombres = "Nombres requeridos";
  if (!formData.apellidos?.trim()) errors.apellidos = "Apellidos requeridos";
  if (!formData.email?.trim()) errors.email = "Email requerido";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || ""))
    errors.email = "Email inválido";
  if (!formData.telefono?.trim()) errors.telefono = "Teléfono requerido";
  if (!formData.ciudad?.trim()) errors.ciudad = "Ciudad requerida";
  if (!formData.pais?.trim()) errors.pais = "País requerido";
  if (!formData.empresaNombre?.trim())
    errors.empresaNombre = "Nombre empresa requerido";
  if (!formData.empresaDireccion?.trim())
    errors.empresaDireccion = "Dirección empresa requerida";
  if (!formData.empresaActividad?.trim())
    errors.empresaActividad = "Actividad empresa requerida";

  return errors;
};

// Persist client to Supabase
import supabase from "./supabaseClient.js";

export const createClientRemote = async (formData) => {
  if (!formData || typeof formData !== "object") {
    console.error("formData inválido", formData);
    throw new Error("Datos de cliente inválidos");
  }

  try {
    const { data, error } = await supabase
      .from("clientes")
      .insert([formData])
      .select();
    if (error) throw error;
    return data?.[0] || formData;
  } catch (err) {
    console.error("createClientRemote error", err);
    throw err;
  }
};
