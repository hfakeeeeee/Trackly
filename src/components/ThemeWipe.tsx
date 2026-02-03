import React, { useEffect, useState } from 'react';

type ThemeWipeProps = {
  transitionId: number;
};

export const ThemeWipe: React.FC<ThemeWipeProps> = ({ transitionId }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (transitionId === 0) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 1100);
    return () => window.clearTimeout(timer);
  }, [transitionId]);

  if (!visible) return null;
  return <div className="theme-spotlight-overlay" />;
};
