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
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-description"
        className="w-full max-w-md rounded-lg border border-white/[0.12] bg-[#121318] p-6 shadow-2xl animate-fadeUp"
      >
        <div className="mb-5 flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-amber-500/30 bg-amber-500/10">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-500">
                VAULT SYNCHRONIZATION
              </span>
            </div>
            <h2 id="auth-title" className="font-serif text-xl font-bold text-white">
              Cine<span className="text-amber-500">Pulse</span> Archive
            </h2>
            <p id="auth-description" className="text-xs text-zinc-400 mt-0.5">
              Sign in to sync your cinema vault across all devices.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-white/[0.08] hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          className="btn-amber mb-3.5 w-full py-2.5 font-bold text-xs"
          onClick={onGuest}
        >
          <Play size={14} fill="currentColor" />
          <span>Continue as Guest (Instant Recruiter Demo)</span>
        </button>

        <div className="my-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <span className="h-px flex-1 bg-white/[0.08]" /> OR <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <button
          type="button"
          className="btn-glass mb-4 w-full py-2.5"
          onClick={onGoogle}
          disabled={!backendAvailable}
        >
          <Chrome size={15} />
          <span>Continue with Google</span>
        </button>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1" htmlFor="auth-email">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              className="input-obsidian text-xs font-sans"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={!backendAvailable}
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              className="input-obsidian text-xs font-sans"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              disabled={!backendAvailable}
            />
          </div>
          <button
            type="submit"
            className="btn-glass w-full py-2.5 font-semibold text-xs"
            disabled={!backendAvailable || busy}
          >
            <Mail size={15} />
            <span>{mode === 'signin' ? 'Sign in to Archive' : 'Create Vault Account'}</span>
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-3.5 rounded-md border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
            {error}
          </p>
        )}
        {!backendAvailable && (
          <p className="mt-3.5 font-mono text-[10px] text-zinc-500 leading-normal">
            Supabase keys not detected in <code>.env</code>. Guest Demo Mode stores all watchlists, ratings, and stats directly in browser local storage.
          </p>
        )}

        <button
          type="button"
          className="mt-4 w-full text-center text-xs text-zinc-400 hover:text-amber-400 transition"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? "Don't have an archive account? Sign up" : 'Already registered? Sign in'}
        </button>
      </div>
    </div>
  );
}
