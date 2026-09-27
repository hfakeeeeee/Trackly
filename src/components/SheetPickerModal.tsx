import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../AppContext';
import { t } from '../i18n';

type SheetPickerModalProps = {
  open: boolean;
  onClose: () => void;
};

export const SheetPickerModal: React.FC<SheetPickerModalProps> = ({ open, onClose }) => {
  const { sheets, currentSheetId, setCurrentSheet, uiSettings } = useApp();
  const [search, setSearch] = useState('');
  const { language } = uiSettings;

  useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  const filteredSheets = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...sheets]
      .sort((a, b) => b.periodSettings.startDate.localeCompare(a.periodSettings.startDate))
      .filter(sheet => !query || sheet.name.toLocaleLowerCase().includes(query));
  }, [search, sheets]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/60 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[min(38rem,calc(100vh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-4 shadow-float sm:p-6 dark:border-ink-700/70 dark:bg-ink-900">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <h2 className="section-title font-heading">{t(language, 'selectSheet')}</h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
              {sheets.length} {t(language, 'sheets').toLocaleLowerCase()}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost">
            {t(language, 'close')}
          </button>
        </div>

        <input
          autoFocus
          type="search"
          className="input mt-5 shrink-0"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t(language, 'searchSheets')}
        />

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl border border-ink-200/70 bg-sand-50/60 p-1 dark:border-white/10 dark:bg-ink-800/50">
          {filteredSheets.map(sheet => (
            <button
              key={sheet.id}
              type="button"
              onClick={() => {
                setCurrentSheet(sheet.id);
                onClose();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                currentSheetId === sheet.id
                  ? 'bg-teal-100 font-semibold text-teal-800 dark:bg-teal-400/15 dark:text-teal-200'
                  : 'text-ink-700 hover:bg-white dark:text-ink-200 dark:hover:bg-white/5'
              }`}
            >
              <span className="min-w-0 truncate">{sheet.name}</span>
              <span className="shrink-0 text-xs opacity-60">{sheet.categories.length}</span>
            </button>
          ))}
          {filteredSheets.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-ink-500 dark:text-ink-400">
              {t(language, 'noMatchingSheet')}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
