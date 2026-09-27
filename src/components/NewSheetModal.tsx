import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../AppContext';
import { t } from '../i18n';

type NewSheetModalProps = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_CATEGORIES = '__default__';

export const NewSheetModal: React.FC<NewSheetModalProps> = ({ open, onClose }) => {
  const { sheets, currentSheetId, addSheet, uiSettings } = useApp();
  const { language } = uiSettings;
  const [name, setName] = useState('');
  const [categorySourceId, setCategorySourceId] = useState(currentSheetId);
  const [sourceSearch, setSourceSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setCategorySourceId(currentSheetId);
    setSourceSearch('');
  }, [currentSheetId, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  const filteredSources = useMemo(() => {
    const query = sourceSearch.trim().toLocaleLowerCase();
    return [...sheets]
      .reverse()
      .filter(sheet => !query || sheet.name.toLocaleLowerCase().includes(query));
  }, [sheets, sourceSearch]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addSheet(name, categorySourceId === DEFAULT_CATEGORIES ? undefined : categorySourceId);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/60 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-4 shadow-float sm:p-6 dark:border-ink-700/70 dark:bg-ink-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="section-title font-heading">{t(language, 'createSheet')}</h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
              {t(language, 'createSheetHint')}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost">
            {t(language, 'close')}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              {t(language, 'newSheetName')}
            </label>
            <input
              autoFocus
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`${t(language, 'sheets')} ${sheets.length + 1}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              {t(language, 'importCategoriesFrom')}
            </label>
            <input
              type="search"
              className="input"
              value={sourceSearch}
              onChange={(event) => setSourceSearch(event.target.value)}
              placeholder={t(language, 'searchSheets')}
            />
            <div className="mt-2 max-h-[min(13rem,32vh)] overflow-y-auto rounded-xl border border-ink-200/70 bg-sand-50/60 p-1 dark:border-white/10 dark:bg-ink-800/50">
              {!sourceSearch.trim() && (
                <button
                  type="button"
                  onClick={() => setCategorySourceId(DEFAULT_CATEGORIES)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    categorySourceId === DEFAULT_CATEGORIES
                      ? 'bg-teal-100 font-semibold text-teal-800 dark:bg-teal-400/15 dark:text-teal-200'
                      : 'text-ink-700 hover:bg-white dark:text-ink-200 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{t(language, 'defaultCategories')}</span>
                  <span className="text-xs opacity-60">6</span>
                </button>
              )}
              {filteredSources.map(sheet => (
                <button
                  key={sheet.id}
                  type="button"
                  onClick={() => setCategorySourceId(sheet.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                    categorySourceId === sheet.id
                      ? 'bg-teal-100 font-semibold text-teal-800 dark:bg-teal-400/15 dark:text-teal-200'
                      : 'text-ink-700 hover:bg-white dark:text-ink-200 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="min-w-0 truncate">
                    {sheet.name}
                    {sheet.id === currentSheetId && (
                      <span className="ml-2 text-[10px] font-medium uppercase tracking-wide opacity-60">
                        {t(language, 'currentSheet')}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs opacity-60">{sheet.categories.length}</span>
                </button>
              ))}
              {filteredSources.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-ink-500 dark:text-ink-400">
                  {t(language, 'noMatchingSheet')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-ink-200/70 pt-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="btn-ghost">
            {t(language, 'cancel')}
          </button>
          <button type="submit" className="btn-primary">
            {t(language, 'createSheet')}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};
