import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = (cb) => {
    setLoading(true);
    setTimeout(() => {
      setLoggedIn(true);
      setLoading(false);
      navigate("/onboarding");
      if (cb) cb();
    }, 800);
  };

  const logout = (cb) => {
    setLoggedIn(false);
    navigate("/auth");
    if (cb) cb();
  };

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}