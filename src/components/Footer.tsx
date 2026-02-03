import React from 'react';
import { useApp } from '../AppContext';
import { t } from '../i18n';

export const Footer: React.FC = () => {
  const { uiSettings } = useApp();
  const { language } = uiSettings;

  return (
    <footer className="mt-10 border-t border-ink-100/70 bg-white/70 backdrop-blur dark:border-ink-800/70 dark:bg-ink-900/60">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <p className="text-center text-ink-500 dark:text-ink-300 text-sm">
          {t(language, 'footer')}
        </p>
      </div>
    </footer>
  );
};
