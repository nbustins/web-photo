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

export const ConfirmationStep = ({ sessionType, groupName, slot, reserverName, result }: ConfirmationStepProps) => (
  <StatusCard tone="success" title="Reserva confirmada!">
    <Text className={styles.summary}>
      {sessionDisplayName(groupName, sessionType.name)} · {dayjs(slot.startAt).format('dddd D MMMM YYYY · HH:mm')}
      <br />
      A nom de {reserverName}
    </Text>
    <Text className={styles.hint}>
      Guarda aquest codi: el necessitaràs per consultar o cancel·lar la reserva.
    </Text>
    <Text copyable strong className={styles.token}>
      {result.confirmationToken}
    </Text>
  </StatusCard>
);
