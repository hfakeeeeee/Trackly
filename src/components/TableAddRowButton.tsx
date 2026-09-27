import React from 'react';

type TableAddRowButtonProps = {
  label: string;
  onClick: () => void;
};

export const TableAddRowButton: React.FC<TableAddRowButtonProps> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 bg-sand-50/60 px-4 py-3 text-sm font-semibold text-ink-600 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 active:scale-[0.995] dark:border-ink-700 dark:bg-ink-800/40 dark:text-ink-300 dark:hover:border-teal-500/60 dark:hover:bg-teal-500/10 dark:hover:text-teal-200"
  >
    <svg className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    {label}
  </button>
);
