import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { t } from '../i18n';

export const AuthScreen: React.FC = () => {
  const { signIn, register, uiSettings } = useApp();
  const { language } = uiSettings;
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 dark:bg-ink-950 dark:text-ink-100">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
        <div className="card card-pad">
          <h1 className="section-title font-heading mb-2">{t(language, 'authTitle')}</h1>
          <p className="text-sm text-ink-600 dark:text-ink-300 mb-6">{t(language, 'authSubtitle')}</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
                {t(language, 'email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
                {t(language, 'password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>
            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-ink-900 py-2 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
            >
              {mode === 'login' ? t(language, 'signIn') : t(language, 'createAccount')}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-ink-600 dark:text-ink-300">
            {mode === 'login' ? t(language, 'needAccount') : t(language, 'alreadyHaveAccount')}{' '}
            <button
              className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              type="button"
            >
              {mode === 'login' ? t(language, 'register') : t(language, 'login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
