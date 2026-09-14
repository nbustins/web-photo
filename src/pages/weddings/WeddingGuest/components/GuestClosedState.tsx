import { FC } from 'react';
import { Typography } from 'antd';
import { StatusCard } from '@ui/StatusCard';
import { SurfaceCardHeader } from '@ui/SurfaceCard';
import shared from './GuestShared.module.css';

const { Text } = Typography;

interface ClosedStateProps {
  title?: string;
}

export const GuestClosedState: FC<ClosedStateProps> = ({ title }) => (
  <StatusCard
    tone="info"
    title="Confirmació tancada"
    header={title ? <SurfaceCardHeader title={title} /> : undefined}
  >
    <Text className={shared.bodyText}>
      La data límit per confirmar l'assistència ha passat. Si necessites fer algún canvi pots tornar a accedir amb el teu codi.
    </Text>
  </StatusCard>
);
