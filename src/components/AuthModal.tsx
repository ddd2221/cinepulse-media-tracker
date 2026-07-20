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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="glass animate-fadeUp w-full max-w-md rounded-2xl p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="auth-title" className="text-xl font-extrabold text-white">Welcome to Cine<span className="text-pulse-400">Pulse</span></h2>
            <p className="text-sm text-slate-400">Sign in to sync your watchlist across devices.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <button className="btn-primary mb-3 w-full" onClick={onGuest}><Play size={16} /> Continue as Guest (instant demo)</button>

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-600">
          <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
        </div>

        <button className="btn-ghost mb-4 w-full" onClick={onGoogle} disabled={!backendAvailable}><Chrome size={16} /> Continue with Google</button>

        <form onSubmit={submit} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="auth-email">Email</label>
          <input id="auth-email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={!backendAvailable} />
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} disabled={!backendAvailable} />
          <button type="submit" className="btn-ghost w-full" disabled={!backendAvailable || busy}><Mail size={16} /> {mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>

        {error && <p role="alert" className="mt-3 rounded-lg bg-pulse-500/10 p-2 text-sm text-pulse-400">{error}</p>}
        {!backendAvailable && <p className="mt-3 text-xs text-slate-500">Supabase keys not found in <code>.env</code> – Google and email auth are disabled. Guest mode stores data in your browser.</p>}

        <button className="mt-4 w-full text-center text-sm text-slate-400 hover:text-white" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
        </button>
      </div>
    </div>
  );
}
