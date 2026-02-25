import supabase from "./supabaseClient.js";

export const initAuth = async () => {
  // Warm up supabase client and restore session
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (err) {
    console.warn("initAuth error", err);
    return null;
  }
};

export const subscribeToAuthState = (callback) => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null);
    },
  );
  return () => listener?.subscription?.unsubscribe?.();
};
