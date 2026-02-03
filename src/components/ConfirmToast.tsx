import React from 'react';

type ConfirmToastProps = {
  open: boolean;
  message: string;
  subtext?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  positionClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmToast: React.FC<ConfirmToastProps> = ({
  open,
  message,
  subtext,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  positionClassName,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const positionClasses = positionClassName ?? 'fixed bottom-6 right-6 z-50';

  return (
    <div className={`${positionClasses} w-[320px] rounded-2xl border border-ink-100/70 bg-white/95 p-4 shadow-float backdrop-blur dark:border-ink-800/70 dark:bg-ink-900/80`}>
      <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{message}</p>
      {subtext ? <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{subtext}</p> : null}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="btn-ghost"
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className="btn-primary bg-rose-600 hover:bg-rose-700 focus:ring-rose-300"
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};
