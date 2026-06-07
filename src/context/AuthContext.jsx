import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";
import { profileService } from "../services/profileService.js";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return null;
    }

    const data = await profileService.getProfileById(currentUser.id);
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const {
          data: { session: activeSession },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!mounted) return;

        setSession(activeSession);
        setUser(activeSession?.user || null);

        if (activeSession?.user) {
          await loadProfile(activeSession.user);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
      setUser(activeSession?.user || null);

      if (activeSession?.user) {
        setLoading(true);
        loadProfile(activeSession.user)
          .catch((error) => console.error(error))
          .finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      isAdmin: profile?.role === "admin",
      loading,
      profile,
      refreshProfile: () => loadProfile(user),
      session,
      signOut,
      user,
    }),
    [loadProfile, loading, profile, session, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  }
  return context;
}
