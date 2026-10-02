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

export const FilterPill: FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={active ? `${styles.filterPill} ${styles.filterPillActive}` : styles.filterPill}
  >
    {children}
  </button>
);

export const AllergenChips: FC<{ allergens: string[] }> = ({ allergens }) => (
  <span>
    {allergens.map(a => <span key={a} className={styles.chip}>{a}</span>)}
  </span>
);

/** "Bus a l'hotel" cell value: Sí / No for attending guests who answered, otherwise a muted placeholder. */
export const TransportValue: FC<{ attending: boolean | null; usesTransport: boolean | null }> = ({ attending, usesTransport }) => {
  if (attending === false) return <span className={styles.muted}>—</span>;
  if (attending === true && usesTransport !== null) return <span>{usesTransport ? 'Sí' : 'No'}</span>;
  return <span className={styles.muted}>Sense resposta</span>;
};

/** "Al·lèrgies" cell value: chips, "Cap" when attending with none, "—" otherwise. */
export const AllergensValue: FC<{ attending: boolean | null; allergens: string[] }> = ({ attending, allergens }) => {
  if (attending !== true) return <span className={styles.muted}>—</span>;
  if (allergens.length === 0) return <span className={styles.muted}>Cap</span>;
  return <AllergenChips allergens={allergens} />;
};
