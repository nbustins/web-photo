import { Button, Row } from 'antd';
import dayjs from 'dayjs';
import { WeddingCard, WeddingCardHeader } from '../../weddings/common';
import { AvailabilitySlot, BookableSessionType, sessionDisplayName } from '../../../services/booking/booking.api';
import { FormValues, IMAGE_RIGHTS_OPTIONS } from '../types';
import { bodyTextStyle, labelStyle } from '../styles';

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      padding: '10px 0',
      borderBottom: '1px solid #eceae2',
    }}
  >
    <span style={{ ...labelStyle, flex: '0 0 auto' }}>{label}</span>
    <span style={{ ...bodyTextStyle, textAlign: 'right', margin: 0 }}>{value}</span>
  </div>
);

interface SummaryStepProps {
  sessionType: BookableSessionType;
  groupName: string;
  slot: AvailabilitySlot;
  values: FormValues;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const SummaryStep = ({ sessionType, groupName, slot, values, submitting, onBack, onConfirm }: SummaryStepProps) => (
  <WeddingCard>
    <WeddingCardHeader
      title="Resum de la reserva"
      subtitle="Revisa les dades abans de confirmar"
    />
    <div style={{ textAlign: 'left', marginTop: 8 }}>
      <SummaryRow label="Sessió" value={sessionDisplayName(groupName, sessionType.name)} />
      <SummaryRow label="Data i hora" value={dayjs(slot.startAt).format('dddd D MMMM YYYY · HH:mm')} />
      <SummaryRow label="Nom i cognoms" value={values.name} />
      <SummaryRow label="Telèfon" value={values.phone} />
      {values.email && <SummaryRow label="Email" value={values.email} />}
      <SummaryRow label="DNI / NIE" value={values.dni} />
      <SummaryRow label="Adreça" value={values.address} />
      <SummaryRow
        label="Participants"
        value={values.participants
          .map(p => (p.age != null ? `${p.name} (${p.age} anys)` : p.name))
          .join(', ')}
      />
      <SummaryRow
        label="Drets d'imatge"
        value={IMAGE_RIGHTS_OPTIONS.find(o => o.value === values.imageRights)?.label ?? ''}
      />
      {values.notes && <SummaryRow label="Notes" value={values.notes} />}
    </div>
    <Row justify="space-between" style={{ marginTop: 24 }}>
      <Button onClick={onBack}>Enrere</Button>
      <Button type="primary" size="large" onClick={onConfirm} loading={submitting}>
        Confirmar reserva
      </Button>
    </Row>
  </WeddingCard>
);
