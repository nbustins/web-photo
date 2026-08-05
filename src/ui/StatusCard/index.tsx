import { FC, ReactNode } from 'react';
import { Typography } from 'antd';
import { SurfaceCard } from '../SurfaceCard';
import styles from './StatusCard.module.css';

const { Title } = Typography;

const ICON: Record<Tone, { char: string; className: string }> = {
  success: { char: '✓', className: styles.iconSuccess },
  error: { char: '✕', className: styles.iconError },
  info: { char: 'ℹ', className: styles.iconInfo },
};

type Tone = 'success' | 'error' | 'info';

interface StatusCardProps {
  tone: Tone;
  title: string;
  /** Capçalera opcional per sobre de la icona (p.ex. el nom de la boda). */
  header?: ReactNode;
  children?: ReactNode;
}

/** Targeta de resultat: icona rodona, títol i cos. Reserves i confirmació de bodes. */
export const StatusCard: FC<StatusCardProps> = ({ tone, title, header, children }) => (
  <SurfaceCard
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    {header}
    <div className={`${styles.icon} ${ICON[tone].className}`}>{ICON[tone].char}</div>
    <Title level={3} className={styles.title}>
      {title}
    </Title>
    {children}
  </SurfaceCard>
);
