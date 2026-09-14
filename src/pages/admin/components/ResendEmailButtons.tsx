import { FC } from 'react';
import { Button, Popconfirm } from 'antd';
import { AdminBooking } from '../../../services/booking/booking.admin.api';
import { AdminIcons } from '../icons';

export type BookingEmailKind = 'requested' | 'confirmed';

/** Button copy and the subject the client will actually see in her inbox. */
const EMAILS: { kind: BookingEmailKind; action: string; subject: string }[] = [
  { kind: 'requested', action: 'Reenviar sol·licitud', subject: 'Hem rebut la teva reserva' },
  { kind: 'confirmed', action: 'Reenviar confirmació', subject: 'La teva sessió està confirmada' },
];

interface ResendEmailButtonsProps {
  booking: AdminBooking;
  loading: boolean;
  onResend: (kind: BookingEmailKind) => void;
}

/**
 * Sending is outward-facing and the client sees it, so each send is confirmed with the subject
 * and the recipient spelled out.
 */
export const ResendEmailButtons: FC<ResendEmailButtonsProps> = ({ booking, loading, onResend }) => {
  const recipient = booking.clientEmail;

  if (!recipient) {
    return <Button icon={<AdminIcons.email />} disabled>La reserva no té email</Button>;
  }

  return (
    <>
      {EMAILS.map(({ kind, action, subject }) => (
        <Popconfirm
          key={kind}
          title="Reenviar aquest email?"
          description={`"${subject}" s'enviarà a ${recipient}.`}
          okText="Enviar"
          cancelText="Deixa-ho estar"
          onConfirm={() => onResend(kind)}
        >
          <Button icon={<AdminIcons.email />} loading={loading}>{action}</Button>
        </Popconfirm>
      ))}
    </>
  );
};
