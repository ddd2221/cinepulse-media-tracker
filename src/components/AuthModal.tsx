import { useState } from 'react';
import { Chrome, Mail, Play, X } from 'lucide-react';

interface Props {
  backendAvailable: boolean;
  error: string | null;
  onClose: () => void;
  onGoogle: () => void;
  onEmail: (email: string, password: string, mode: 'signin' | 'signup') => Promise<boolean | void>;
  onGuest: () => void;
}

export default function AuthModal({ backendAvailable, error, onClose, onGoogle, onEmail, onGuest }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await onEmail(email, password, mode);
    setBusy(false);
    if (ok && mode === 'signin') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-description"
        className="w-full max-w-md rounded-sm border border-[#2c3440] bg-[#1f252c] p-6 shadow-2xl animate-fadeUp"
      >
        <div className="mb-5 flex items-start justify-between border-b border-[#2c3440] pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#ff8000]" />
              <span className="h-2 w-2 rounded-full bg-[#00e054]" />
              <span className="h-2 w-2 rounded-full bg-[#40bcf4]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00e054] ml-1">
                ACCOUNT & SYNC
              </span>
            </div>
            <h2 id="auth-title" className="font-serif text-xl font-bold text-white">
              Welcome to Cine<span className="text-[#00e054]">Pulse</span>
            </h2>
            <p id="auth-description" className="text-xs text-[#99aabb]">
              Sign in to sync your film diary & ratings across devices.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-sm p-1 text-[#667788] hover:bg-[#2c3440] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          className="lb-btn-green mb-3 w-full py-2.5 font-bold text-xs"
          onClick={onGuest}
        >
          <Play size={15} fill="currentColor" />
          <span>Continue as Guest (Instant Recruiter Demo)</span>
        </button>

        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#667788]">
          <span className="h-px flex-1 bg-[#2c3440]" /> OR <span className="h-px flex-1 bg-[#2c3440]" />
        </div>

        <button
          type="button"
          className="lb-btn-ghost mb-4 w-full py-2"
          onClick={onGoogle}
          disabled={!backendAvailable}
        >
          <Chrome size={15} />
          <span>Continue with Google</span>
        </button>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#99aabb] mb-1" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              className="lb-input text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={!backendAvailable}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#99aabb] mb-1" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              className="lb-input text-xs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              disabled={!backendAvailable}
            />
          </div>
          <button
            type="submit"
            className="lb-btn-ghost w-full py-2"
            disabled={!backendAvailable || busy}
          >
            <Mail size={15} />
            <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-3 rounded-sm border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
            {error}
          </p>
        )}
        {!backendAvailable && (
          <p className="mt-3 text-[11px] text-[#667788]">
            Supabase keys not detected in <code>.env</code>. Guest Demo Mode stores all watchlists, ratings, and stats directly in your browser.
          </p>
        )}

        <button
          type="button"
          className="mt-4 w-full text-center text-xs text-[#99aabb] hover:text-[#00e054] transition"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
        </button>
      </div>
    </div>
  );
}
