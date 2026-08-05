import { Typography } from 'antd';
import { SurfaceCard } from '@ui/SurfaceCard';
import styles from './StatusCard.module.css';

const { Title } = Typography;

interface StatusCardProps {
  variant: 'success' | 'error';
  title: string;
  children: React.ReactNode;
}

/** Animated result card with a round icon: success (✓) or error (✕). */
export const StatusCard = ({ variant, title, children }: StatusCardProps) => (
  <SurfaceCard
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className={`${styles.icon} ${variant === 'success' ? styles.iconSuccess : styles.iconError}`}>
      {variant === 'success' ? '✓' : '✕'}
    </div>
    <Title level={3} className={styles.title}>
      {title}
    </Title>
    {children}
  </SurfaceCard>
);
