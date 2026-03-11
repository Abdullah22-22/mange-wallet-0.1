import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AuthContext = createContext(null);

const PUBLIC_PATHS = ["/", "/register"]; 

export function AuthProvider({ children }) {
  const auth = useAuth();
  const [booting, setBooting] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.includes(location.pathname);

    if (isPublic) {
      setBooting(false); 
      return;
    }

    auth.renew()
      .catch(() => {})
      .finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ ...auth, booting }}>
      {booting ? <div style={{ padding: 16 }}>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}