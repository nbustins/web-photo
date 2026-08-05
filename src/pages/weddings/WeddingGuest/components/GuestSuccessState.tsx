import { FC } from 'react';
import { Typography, Button } from 'antd';
import { StatusCard } from '@ui/StatusCard';
import shared from './GuestShared.module.css';
import styles from './GuestStates.module.css';

const { Text } = Typography;

interface GuestSuccessStateProps {
  attendingCount: number;
  totalCount: number;
  onReset?: () => void;
}

export const GuestSuccessState: FC<GuestSuccessStateProps> = ({ attendingCount, totalCount, onReset }) => {
  const allAttending = attendingCount === totalCount && totalCount > 0;
  const noneAttending = attendingCount === 0;

  const message = allAttending
    ? 'Gràcies per confirmar la vostra assistència. Esperem veure-us a la celebració!'
    : noneAttending
      ? 'Ens sap greu que no pugueu assistir. Us trobarem a faltar!'
      : `${attendingCount} de ${totalCount} persones assistiran a la celebració. Gràcies per confirmar!`;

  return (
    <StatusCard tone="success" title="Confirmació rebuda!">
      <Text className={shared.bodyText}>{message}</Text>
      <Text className={styles.successHint}>
        Pots tancar aquesta finestra, si vols modificar la teva confirmació accedeix de nou amb el codi.
      </Text>
      {onReset && (
        <Button type="primary" size="large" onClick={onReset} className={styles.successButton}>
          Tornar a introduir codi
        </Button>
      )}
    </StatusCard>
  );
};
