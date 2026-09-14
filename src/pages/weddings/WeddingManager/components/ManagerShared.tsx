import { FC } from 'react';
import styles from './ManagerShared.module.css';

export const StatusPill: FC<{ attending: boolean | null }> = ({ attending }) => {
  if (attending === true) {
    return <span className={`${styles.pill} ${styles.pillConfirmed}`}>Confirmat</span>;
  }
  if (attending === false) {
    return <span className={`${styles.pill} ${styles.pillDeclined}`}>Rebutjat</span>;
  }
  return <span className={`${styles.pill} ${styles.pillPending}`}>Pendent</span>;
};

export const LabelTag: FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <span
    onClick={onClick}
    className={onClick ? `${styles.labelTag} ${styles.labelTagClickable}` : styles.labelTag}
  >
    {children}
  </span>
);

export const StatCell: FC<{ value: number; label: string; tone?: 'success' | 'danger' }> = ({ value, label, tone }) => {
  const toneClass = tone === 'success' ? styles.statValueSuccess : tone === 'danger' ? styles.statValueDanger : '';
  return (
    <div className={styles.stat}>
      <span className={`${styles.statValue} ${toneClass}`}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
};
