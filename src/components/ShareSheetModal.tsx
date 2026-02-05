import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { t } from '../i18n';
import type { ShareVisibility } from '../types';

interface ShareSheetModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({ open, onClose }) => {
  const { currentSheet, enableShare, disableShare, uiSettings } = useApp();
  const { language } = uiSettings;
  const [visibility, setVisibility] = useState<ShareVisibility>('public');
  const [allowedEmails, setAllowedEmails] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentSheet.share) {
      setVisibility(currentSheet.share.visibility);
      setAllowedEmails(currentSheet.share.allowedEmails.join(', '));
    } else {
      setVisibility('public');
      setAllowedEmails('');
    }
    setStatus('');
  }, [currentSheet.share, open]);

  const shareLink = useMemo(() => {
    if (!currentSheet.share?.id) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('share', currentSheet.share.id);
    return url.toString();
  }, [currentSheet.share?.id]);

  if (!open) return null;

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setStatus(t(language, 'shareCopied'));
    } catch {
      setStatus(t(language, 'shareCopyFailed'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    const emails = allowedEmails
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    try {
      await enableShare(visibility, emails);
      setStatus(t(language, 'shareUpdated'));
    } catch (err) {
      if (err instanceof Error) {
        setStatus(err.message);
      } else {
        setStatus(t(language, 'shareError'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStop = async () => {
    setSaving(true);
    setStatus('');
    try {
      await disableShare();
      setStatus(t(language, 'shareDisabled'));
    } catch {
      setStatus(t(language, 'shareError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-ink-200/70 bg-white p-6 shadow-float dark:border-ink-700/70 dark:bg-ink-900">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="section-title font-heading">{t(language, 'shareSheet')}</h2>
            <p className="text-sm text-ink-500 dark:text-ink-300">{currentSheet.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-ink-900/10 px-2 py-1 text-xs font-semibold text-ink-700 hover:bg-ink-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            {t(language, 'close')}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
              {t(language, 'shareVisibility')}
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ShareVisibility)}
              className="input"
            >
              <option value="public">{t(language, 'sharePublic')}</option>
              <option value="restricted">{t(language, 'shareRestricted')}</option>
              <option value="invited">{t(language, 'shareInvited')}</option>
            </select>
          </div>

          {visibility === 'invited' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
                {t(language, 'shareAllowed')}
              </label>
              <textarea
                value={allowedEmails}
                onChange={(e) => setAllowedEmails(e.target.value)}
                className="input min-h-[90px]"
                placeholder="email@example.com, other@example.com"
              />
            </div>
          )}

          {currentSheet.share?.id && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
                {t(language, 'shareLink')}
              </label>
              <div className="flex items-center gap-2">
                <input className="input flex-1" value={shareLink} readOnly />
                <button
                  onClick={handleCopy}
                  className="rounded-xl bg-ink-900 px-3 py-2 text-xs font-semibold text-white hover:bg-ink-800"
                >
                  {t(language, 'copyLink')}
                </button>
              </div>
            </div>
          )}

          {status && (
            <div className="rounded-lg bg-ink-900/5 px-3 py-2 text-xs text-ink-700 dark:bg-white/10 dark:text-ink-100">
              {status}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleStop}
            disabled={!currentSheet.share?.id || saving}
            className="rounded-xl border border-ink-200/70 px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-100 disabled:opacity-50 dark:border-ink-700/70 dark:text-ink-100 dark:hover:bg-ink-800"
          >
            {t(language, 'shareDisable')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
          >
            {t(language, 'shareSave')}
          </button>
        </div>
      </div>
    </div>
  );
};
