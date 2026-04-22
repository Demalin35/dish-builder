import React from "react";
import {
  getSessionUser,
  signIn as signInRequest,
  signOut as signOutRequest,
  signUp as signUpRequest,
} from "../services/authService";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    getSessionUser().then((sessionUser) => {
      if (!isMounted) return;
      setUser(sessionUser);
      setIsBootstrapping(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = React.useCallback(async (formData) => {
    const loggedInUser = await signInRequest(formData);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signUp = React.useCallback(async (formData) => {
    const createdUser = await signUpRequest(formData);
    setUser(createdUser);
    return createdUser;
  }, []);

  const signOut = React.useCallback(async () => {
    await signOutRequest();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      signIn,
      signUp,
      signOut,
    }),
    [user, isBootstrapping, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
