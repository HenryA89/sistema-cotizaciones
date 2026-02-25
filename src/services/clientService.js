import supabase from "./supabaseClient.js";

export const updateClientData = async (clientId, updates) => {
  try {
    const { error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", clientId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateClientData error", err);
    return false;
  }
};

export const getNotes = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from("notas")
      .select("*")
      .eq("cliente_id", clientId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("getNotes error", err);
    return [];
  }
};

export const addNote = async (clientId, content, type = "general") => {
  if (!content || !content.trim()) return null;
  try {
    const { data, error } = await supabase
      .from("notas")
      .insert([
        {
          cliente_id: clientId,
          contenido: content.trim(),
          tipo: type,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("addNote error", err);
    return null;
  }
};

export const updateNote = async (noteId, content, type = "general") => {
  try {
    const { data, error } = await supabase
      .from("notas")
      .update({
        contenido: content,
        tipo: type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .select()
      .single();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("updateNote error", err);
    return null;
  }
};

export const deleteNote = async (noteId) => {
  try {
    const { error } = await supabase.from("notas").delete().eq("id", noteId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteNote error", err);
    return false;
  }
};

const base64ToBlob = (base64Data, contentType = "image/jpeg") => {
  const byteCharacters = atob(base64Data.split(",")[1] || base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

export const uploadClientPhoto = async (clientId, base64) => {
  try {
    const blob = base64ToBlob(base64);
    const fileName = `clients/${clientId}/photo-${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("client-uploads")
      .upload(fileName, blob, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("client-uploads")
      .getPublicUrl(fileName);

    // Update client's foto_url
    await updateClientData(clientId, { foto_url: publicUrlData?.publicUrl });
    return publicUrlData?.publicUrl;
  } catch (err) {
    console.error("uploadClientPhoto error", err);
    return null;
  }
};
