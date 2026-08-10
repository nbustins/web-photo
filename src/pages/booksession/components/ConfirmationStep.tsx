import { Typography } from 'antd';
import dayjs from 'dayjs';
import { AvailabilitySlot, CreateBookingResult, BookableSessionType, sessionDisplayName } from '../../../services/booking/booking.api';
import { StatusCard } from '@ui/StatusCard';
import styles from './ConfirmationStep.module.css';

const { Text } = Typography;

interface ConfirmationStepProps {
  sessionType: BookableSessionType;
  groupName: string;
  slot: AvailabilitySlot;
  reserverName: string;
  result: CreateBookingResult;
}

export const ConfirmationStep = ({ sessionType, groupName, slot, reserverName }: ConfirmationStepProps) => (
  <StatusCard tone="success" title="Reserva sol·licitada!">
    <Text className={styles.summary}>
      {sessionDisplayName(groupName, sessionType.name)} · {dayjs(slot.startAt).format('dddd D MMMM YYYY · HH:mm')}
      <br />
      A nom de {reserverName}
    </Text>
    <Text className={styles.hint}>
      Rebràs un correu amb l'enllaç per firmar el contracte de la sessió. Un cop signat rebràs la confirmació de la reserva.    
    </Text>
  </StatusCard>
);
