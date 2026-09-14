import { FC } from 'react';
import { Button, Typography } from 'antd';
import { StatusCard } from '@ui/StatusCard';
import { SurfaceCardHeader } from '@ui/SurfaceCard';
import shared from './GuestShared.module.css';
import styles from './GuestStates.module.css';

const { Text } = Typography;

interface NotFoundStateProps {
  title?: string;
  onReset: () => void;
}

export const GuestNotFoundState: FC<NotFoundStateProps> = ({ title, onReset }) => (
  <StatusCard
    tone="error"
    title="Convidat no trobat"
    header={title ? <SurfaceCardHeader title={title} /> : undefined}
  >
    <Text className={shared.bodyText}>
      No hem trobat cap convidat amb aquest codi. Si us plau, verifica el codi i torna-ho a intentar.
    </Text>
    <Button type="primary" onClick={onReset} className={styles.resetButton}>
      Tornar a introduir codi
    </Button>
  </StatusCard>
);
