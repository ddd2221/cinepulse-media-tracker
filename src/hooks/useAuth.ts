import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import type { AppUser } from '../types/media';

const GUEST_KEY = 'cinepulse:guest';

const GUEST_USER: AppUser = { id: 'guest', email: 'guest@cinepulse.demo', name: 'Guest', isGuest: true };

const mapSession = (session: Session | null): AppUser | null =>
  session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: (session.user.user_metadata?.full_name as string | undefined) ?? session.user.email?.split('@')[0] ?? 'User',
        isGuest: false,
      }
    : null;

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(() => (localStorage.getItem(GUEST_KEY) ? GUEST_USER : null));
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const mapped = mapSession(data.session);
      if (mapped) setUser(mapped);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const mapped = mapSession(session);
      setUser((prev) => mapped ?? (prev?.isGuest ? prev : null));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, '1');
    setUser(GUEST_USER);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!supabase) return setError('Supabase is not configured – use Guest Demo Mode.');
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (e) setError(e.message);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!supabase) return setError('Supabase is not configured – use Guest Demo Mode.');
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) setError(e.message);
    return !e;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!supabase) return setError('Supabase is not configured – use Guest Demo Mode.');
    const { data, error: e } = await supabase.auth.signUp({ email, password });
    if (e) setError(e.message);
    else if (!data.session) setError('Check your inbox to confirm your email, then sign in.');
    return !e;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(GUEST_KEY);
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  return {
    user, loading, error, clearError: () => setError(null),
    backendAvailable: isSupabaseConfigured,
    continueAsGuest, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut,
  };
}
