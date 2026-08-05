import { Button, Row } from 'antd';
import dayjs from 'dayjs';
import { SurfaceCard, SurfaceCardHeader } from '@ui/SurfaceCard';
import { AvailabilitySlot, BookableSessionType, sessionDisplayName } from '../../../services/booking/booking.api';
import { FormValues, IMAGE_RIGHTS_OPTIONS } from '../types';
import styles from './SummaryStep.module.css';

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.row}>
    <span className={styles.rowLabel}>{label}</span>
    <span className={styles.rowValue}>{value}</span>
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
  <SurfaceCard>
    <SurfaceCardHeader
      title="Resum de la reserva"
      subtitle="Revisa les dades abans de confirmar"
    />
    <div className={styles.list}>
      <SummaryRow label="Sessió" value={sessionDisplayName(groupName, sessionType.name)} />
      <SummaryRow label="Data i hora" value={dayjs(slot.startAt).format('dddd D MMMM YYYY · HH:mm')} />
      <SummaryRow label="Nom i cognoms" value={values.name} />
      <SummaryRow label="Telèfon" value={values.phone} />
      <SummaryRow label="Email" value={values.email} />
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
    <Row justify="space-between" className={styles.actions}>
      <Button onClick={onBack}>Enrere</Button>
      <Button type="primary" size="large" onClick={onConfirm} loading={submitting}>
        Confirmar reserva
      </Button>
    </Row>
  </SurfaceCard>
);
