'use client';

import { useState } from 'react';
import { api } from '@streaming/api-client';

type AuthScreen = 'login' | 'register';

export default function Home() {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (screen === 'login') {
        const res = await api.login({ email, password });
        setToken(res.accessToken);
      } else {
        const res = await api.register({ email, password, displayName });
        setToken(res.accessToken);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Streaming App</h1>
          <p className="text-zinc-400">You are now logged in.</p>
          <button onClick={() => setToken(null)} className="btn-primary">
            Logout
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Streaming App</h1>
          <p className="text-zinc-400 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {screen === 'register' && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-base w-full"
              required
              minLength={2}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base w-full"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base w-full"
            required
            minLength={8}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Loading...' : screen === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          {screen === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={() => { setScreen('register'); setError(''); }} className="text-primary-500 hover:underline">
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setScreen('login'); setError(''); }} className="text-primary-500 hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
