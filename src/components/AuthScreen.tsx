import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { t } from '../i18n';

export const AuthScreen: React.FC = () => {
  const { signIn, register, sendPasswordReset, resendVerification, uiSettings } = useApp();
  const { language } = uiSettings;
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const passwordRules = useMemo(
    () => [
      { id: 'length', label: t(language, 'passwordRuleLength'), valid: password.length >= 8 },
      { id: 'upper', label: t(language, 'passwordRuleUpper'), valid: /[A-Z]/.test(password) },
      { id: 'lower', label: t(language, 'passwordRuleLower'), valid: /[a-z]/.test(password) },
      { id: 'number', label: t(language, 'passwordRuleNumber'), valid: /\d/.test(password) },
    ],
    [language, password]
  );

  const isPasswordValid = passwordRules.every(rule => rule.valid);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    if (mode !== 'forgot' && !password.trim()) return;
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else if (mode === 'register') {
        if (!isPasswordValid) {
          setError(t(language, 'passwordRuleError'));
          return;
        }
        if (password !== confirmPassword) {
          setError(t(language, 'passwordMismatch'));
          return;
        }
        await register(email.trim(), password);
        setNotice(t(language, 'verifyEmailSent'));
        setVerificationSent(true);
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else {
        await sendPasswordReset(email.trim());
        setNotice(t(language, 'resetEmailSent'));
        setMode('login');
        setPassword('');
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
    <div className="min-h-screen bg-ink-950 text-ink-900 dark:text-ink-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-ink-900 text-white lg:flex">
          <div className="absolute inset-0">
            <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-teal-400/40 blur-[120px] animate-slow-float" />
            <div className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-amber-300/30 blur-[130px] animate-slow-float" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
          </div>
          <div className="relative z-10 flex w-full flex-col justify-between p-12">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">{t(language, 'welcomeBadge')}</p>
              <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight">
                {t(language, 'authHeroTitle')}
              </h2>
              <p className="mt-4 max-w-md text-sm text-white/70">{t(language, 'authHeroBody')}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-white/80">{t(language, 'authQuote')}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/50">{t(language, 'authQuoteAuthor')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-sand-50 px-4 py-12 dark:bg-ink-950">
          <div className="w-full max-w-md animate-rise-in">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="font-heading text-3xl font-semibold text-ink-900 dark:text-ink-100">
                {t(language, mode === 'forgot' ? 'forgotTitle' : 'authTitle')}
              </h1>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
                {t(language, mode === 'forgot' ? 'forgotSubtitle' : 'authSubtitle')}
              </p>
            </div>

            <div className="card card-pad animate-fade-in">
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

                {mode !== 'forgot' && (
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
                )}

                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
                        {t(language, 'confirmPassword')}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    <div className="rounded-xl border border-ink-200/70 bg-white/80 p-3 text-xs text-ink-500 dark:border-ink-700/70 dark:bg-ink-900/60 dark:text-ink-300">
                      <p className="mb-2 font-semibold text-ink-700 dark:text-ink-100">{t(language, 'passwordRulesTitle')}</p>
                      <ul className="space-y-1">
                        {passwordRules.map(rule => (
                          <li key={rule.id} className={rule.valid ? 'text-teal-600 dark:text-teal-300' : ''}>
                            {rule.valid ? '•' : '○'} {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {error && (
                  <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                {notice}
                {mode === 'login' && verificationSent && (
                  <div className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-200/80">
                    {t(language, 'checkSpam')}
                  </div>
                )}
              </div>
            )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-ink-900 py-2 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
                >
                  {mode === 'login' && t(language, 'signIn')}
                  {mode === 'register' && t(language, 'createAccount')}
                  {mode === 'forgot' && t(language, 'sendReset')}
                </button>
              </form>

              <div className="mt-4 flex flex-col gap-3 text-center text-sm text-ink-600 dark:text-ink-300">
                {mode === 'login' && (
                  <>
                    <button
                      className="font-semibold text-ink-700 hover:text-ink-900 dark:text-ink-200 dark:hover:text-white"
                      onClick={() => setMode('forgot')}
                      type="button"
                    >
                      {t(language, 'forgotPassword')}
                    </button>
                    {verificationSent && (
                      <button
                        className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                        onClick={async () => {
                          setSubmitting(true);
                          setError('');
                          setNotice('');
                          try {
                            await resendVerification();
                            setNotice(t(language, 'verifyEmailResent'));
                          } catch (err) {
                            if (err instanceof Error) {
                              setError(err.message);
                            } else {
                              setError('Authentication failed.');
                            }
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        type="button"
                      >
                        {t(language, 'resendVerification')}
                      </button>
                    )}
                    <div>
                      {t(language, 'needAccount')}{' '}
                      <button
                        className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                        onClick={() => setMode('register')}
                        type="button"
                      >
                        {t(language, 'register')}
                      </button>
                    </div>
                  </>
                )}

                {mode === 'register' && (
                  <div>
                    {t(language, 'alreadyHaveAccount')}{' '}
                    <button
                      className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                      onClick={() => setMode('login')}
                      type="button"
                    >
                      {t(language, 'login')}
                    </button>
                  </div>
                )}

                {mode === 'forgot' && (
                  <div>
                    <button
                      className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                      onClick={() => setMode('login')}
                      type="button"
                    >
                      {t(language, 'backToLogin')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
