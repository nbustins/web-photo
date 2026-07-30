import { Typography } from 'antd';
import dayjs from 'dayjs';
import { AvailabilitySlot, CreateBookingResult, BookableSessionType, sessionDisplayName } from '../../../services/booking/booking.api';
import { bodyTextStyle } from '../styles';
import { StatusCard } from './StatusCard';

const { Text } = Typography;

interface ConfirmationStepProps {
  sessionType: BookableSessionType;
  groupName: string;
  slot: AvailabilitySlot;
  reserverName: string;
  result: CreateBookingResult;
}

export const ConfirmationStep = ({ sessionType, groupName, slot, reserverName, result }: ConfirmationStepProps) => (
  <StatusCard variant="success" title="Reserva confirmada!">
    <Text style={{ ...bodyTextStyle, display: 'block' }}>
      {sessionDisplayName(groupName, sessionType.name)} · {dayjs(slot.startAt).format('dddd D MMMM YYYY · HH:mm')}
      <br />
      A nom de {reserverName}
    </Text>
    <Text style={{ ...bodyTextStyle, display: 'block', fontSize: 'clamp(0.8rem, 1.2vw, 0.85rem)', color: '#9a9a9a', marginTop: 16 }}>
      Guarda aquest codi: el necessitaràs per consultar o cancel·lar la reserva.
    </Text>
    <Text copyable strong style={{ fontFamily: "'Raleway', sans-serif", fontSize: '1.1rem' }}>
      {result.confirmationToken}
    </Text>
  </StatusCard>
);
