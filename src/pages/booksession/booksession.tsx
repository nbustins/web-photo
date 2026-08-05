import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Spin, Steps, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ca';
import { AppRoutes } from '../../model/routes.model';
import { ApiError } from '../../services/api.client';
import { createBooking, AvailabilitySlot, CreateBookingResult } from '../../services/booking/booking.api';
import { FormValues } from './types';
import { useMonthAvailability, useSessionType } from './hooks';
import { StatusCard } from '@ui/StatusCard';
import { SessionTypePicker } from './components/SessionTypePicker';
import { DateTimeStep } from './components/DateTimeStep';
import { DetailsFormStep } from './components/DetailsFormStep';
import { SummaryStep } from './components/SummaryStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import shared from './shared.module.css';
import styles from './booksession.module.css';

dayjs.locale('ca');

export const BookSession = () => {
  const { sessionTypeId } = useParams();
  const navigate = useNavigate();

  // The route param only seeds the choice; from there the picker owns it and the URL stays put.
  const [typeId, setTypeId] = useState<number | undefined>(
    sessionTypeId ? Number(sessionTypeId) : undefined,
  );

  const { groups, sessionType, groupName, loading, error, setError } = useSessionType(typeId);
  const { month, setMonth, slotsByDate, loading: loadingSlots, reload } = useMonthAvailability(sessionType);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const [step, setStep] = useState(0);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateBookingResult | null>(null);

  const doSubmit = async () => {
    if (!sessionType || !selectedSlot || !formValues) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createBooking({
        sessionTypeId: sessionType.id,
        startAt: selectedSlot.startAt,
        reserver: {
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          dni: formValues.dni,
          address: formValues.address,
        },
        participants: formValues.participants.map(participant => ({
          name: participant.name,
          age: participant.age ?? undefined,
        })),
        imageRights: formValues.imageRights,
        notes: formValues.notes || undefined,
      });
      setResult(created);
      setStep(3);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setSubmitError('Aquesta hora ja no està disponible. Torna a triar una hora, les teves dades es conserven.');
        setSelectedSlot(null);
        setSelectedDate(null);
        setStep(0);
        reload();
      } else if (err instanceof ApiError && err.status === 404) {
        setError(true);
      } else if (err instanceof ApiError && err.status === 429) {
        setSubmitError('Massa intents. Espera uns minuts i torna-ho a provar.');
      } else {
        setSubmitError(err instanceof ApiError ? err.message : "No s'ha pogut fer la reserva. Torna-ho a provar.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={shared.page}>
        <StatusCard tone="error" title="Sessió no disponible">
          <Typography.Text className={shared.bodyText}>
            Aquesta sessió no existeix o ja no s'ofereix. Tria una sessió des de la pàgina del servei.
          </Typography.Text>
          <div>
            <Button type="primary" onClick={() => navigate(AppRoutes.home)} className={styles.backButton}>
              Torna a l'inici
            </Button>
          </div>
        </StatusCard>
      </div>
    );
  }

  return (
    <div className={shared.page}>
      {/* Arriving with the type in the URL (pricing card) means the choice is already made. */}
      {!sessionTypeId && step === 0 && (
        <div className={styles.pickerWrap}>
          <SessionTypePicker
            groups={groups}
            value={sessionType?.id}
            onChange={id => {
              setTypeId(id);
              setSelectedDate(null);
              setSelectedSlot(null);
            }}
          />
        </div>
      )}

      <Steps
        current={step}
        responsive={false}
        size="small"
        className={styles.steps}
        items={[{ title: 'Data' }, { title: 'Dades' }, { title: 'Resum' }, { title: 'Confirmació' }]}
      />

      {submitError && (
        <Alert type="warning" showIcon message={submitError} closable
          onClose={() => setSubmitError(null)} className={styles.alert} />
      )}

      {step === 0 && sessionType && (
        <DateTimeStep
          sessionType={sessionType}
          groupName={groupName}
          month={month}
          onMonthChange={setMonth}
          slotsByDate={slotsByDate}
          loadingSlots={loadingSlots}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && sessionType && selectedSlot && (
        <DetailsFormStep
          sessionType={sessionType}
          groupName={groupName}
          slot={selectedSlot}
          initialValues={formValues}
          onBack={() => setStep(0)}
          onSubmit={values => { setFormValues(values); setStep(2); }}
        />
      )}

      {step === 2 && sessionType && selectedSlot && formValues && (
        <SummaryStep
          sessionType={sessionType}
          groupName={groupName}
          slot={selectedSlot}
          values={formValues}
          submitting={submitting}
          onBack={() => setStep(1)}
          onConfirm={doSubmit}
        />
      )}

      {step === 3 && sessionType && selectedSlot && formValues && result && (
        <ConfirmationStep
          sessionType={sessionType}
          groupName={groupName}
          slot={selectedSlot}
          reserverName={formValues.name}
          result={result}
        />
      )}
    </div>
  );
};
