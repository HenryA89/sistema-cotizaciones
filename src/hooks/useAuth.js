import { useState, useEffect } from "react";
import { initAuth, subscribeToAuthState } from "../services/authService.js";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await initAuth();
    };
    initialize();
    const unsubscribe = subscribeToAuthState(setUser);
    return () => unsubscribe();
  }, []);

  return user;
};
