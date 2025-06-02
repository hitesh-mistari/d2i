import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateSession = useCallback((currentSession) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);
  }, []);

  const clearSessionData = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      updateSession(initialSession);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        updateSession(currentSession);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [updateSession]);

  const value = {
    session,
    user,
    loading,
    setSession: updateSession,
    clearSession: clearSessionData,
    signUp: (credentials) => supabase.auth.signUp(credentials),
    signInWithPassword: (credentials) => supabase.auth.signInWithPassword(credentials),
    signInWithOAuth: (options) => supabase.auth.signInWithOAuth(options),
    signOut: () => supabase.auth.signOut().then(() => clearSessionData()),
    sendPasswordResetEmail: (email) => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    }),
    updateUserPassword: (newPassword) => supabase.auth.updateUser({ password: newPassword })
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};