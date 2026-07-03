import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert, Button, Calendar, Col, Form, Input, InputNumber, Radio,
  Row, Spin, Steps, Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ca';
import { WeddingCard, WeddingCardHeader } from '../weddings/common';
import { pageBodyPadding } from '../../styles/tokens/radii';
import { AppRoutes } from '../../model/routes.model';
import { ApiError } from '../../services/api.client';
import {
  fetchSessionGroups, fetchAvailability, createBooking,
  SessionType, AvailabilitySlot, CreateBookingResult, ImageRightsConsent,
} from '../../services/booking/booking.api';

dayjs.locale('ca');

const { Text, Title } = Typography;

const DNI_REGEX = /^(\d{8}[A-Za-z]|[XYZxyz]\d{7}[A-Za-z])$/;

const IMAGE_RIGHTS_OPTIONS: { label: string; value: ImageRightsConsent }[] = [
  { label: 'SI CEDEIXO ELS DRETS', value: 'GrantAll' },
  { label: 'NO CEDEIXO ELS DRETS', value: 'DenyAll' },
  { label: 'NO CEDEIXO ELS DRETS DELS MENORS PERO SI ELS MEUS', value: 'GrantMineDenyMinors' },
];

const labelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.85rem, 1.3vw, 0.9rem)',
  fontWeight: 500,
  color: '#5a5a5a',
  letterSpacing: '0.02em',
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  borderRadius: 8,
};

const bodyTextStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
  color: '#6a6a6a',
  lineHeight: 1.7,
};

const summaryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  padding: '10px 0',
  borderBottom: '1px solid #eceae2',
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div style={summaryRowStyle}>
    <span style={{ ...labelStyle, flex: '0 0 auto' }}>{label}</span>
    <span style={{ ...bodyTextStyle, textAlign: 'right', margin: 0 }}>{value}</span>
  </div>
);

const successIconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #7C7458 0%, #6a6450 100%)',
  color: 'white',
  fontSize: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

const errorIconStyle: React.CSSProperties = {
  ...successIconStyle,
  background: 'linear-gradient(135deg, #a09880 0%, #8a8070 100%)',
};

interface FormValues {
  name: string;
  email?: string;
  phone: string;
  dni: string;
  address: string;
  participants: { name: string; age?: number }[];
  imageRights: ImageRightsConsent;
  notes?: string;
}

export const BookSession = () => {
  const { sessionTypeId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const typeId = Number(sessionTypeId);

  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [groupName, setGroupName] = useState('');
  const [loadingType, setLoadingType] = useState(true);
  const [typeError, setTypeError] = useState(false);

  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [slotsByDate, setSlotsByDate] = useState<Record<string, AvailabilitySlot[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const [step, setStep] = useState(0);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateBookingResult | null>(null);

  useEffect(() => {
    if (!sessionTypeId || Number.isNaN(typeId)) {
      setLoadingType(false);
      setTypeError(true);
      return;
    }
    fetchSessionGroups()
      .then(groups => {
        for (const group of groups) {
          const type = group.sessionTypes.find(t => t.id === typeId && t.isActive);
          if (type) {
            setSessionType(type);
            setGroupName(group.name);
            return;
          }
        }
        setTypeError(true);
      })
      .catch(() => setTypeError(true))
      .finally(() => setLoadingType(false));
  }, [sessionTypeId, typeId]);

  const loadMonth = useCallback((target: Dayjs) => {
    if (!sessionType) return;
    const monthStart = target.startOf('month');
    const start = monthStart.isBefore(dayjs(), 'day') ? dayjs() : monthStart;
    const end = target.endOf('month');
    if (end.isBefore(dayjs(), 'day')) {
      setSlotsByDate({});
      return;
    }
    setLoadingSlots(true);
    fetchAvailability(sessionType.id, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'))
      .then(availability => {
        const byDate: Record<string, AvailabilitySlot[]> = {};
        for (const day of availability.days) {
          if (day.slots.length > 0) byDate[day.date] = day.slots;
        }
        setSlotsByDate(byDate);
      })
      .catch(() => setSlotsByDate({}))
      .finally(() => setLoadingSlots(false));
  }, [sessionType]);

  useEffect(() => {
    loadMonth(month);
  }, [loadMonth, month]);

  const hasAnySlots = Object.keys(slotsByDate).length > 0;
  const selectedDaySlots = selectedDate ? slotsByDate[selectedDate.format('YYYY-MM-DD')] ?? [] : [];

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
          email: formValues.email || undefined,
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
        loadMonth(month);
      } else if (err instanceof ApiError && err.status === 404) {
        setTypeError(true);
      } else if (err instanceof ApiError && err.status === 429) {
        setSubmitError('Massa intents. Espera uns minuts i torna-ho a provar.');
      } else {
        setSubmitError(err instanceof ApiError ? err.message : "No s'ha pogut fer la reserva. Torna-ho a provar.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    padding: pageBodyPadding,
    maxWidth: 820,
    margin: '0 auto',
    minHeight: 'calc(100vh - 130px)',
  };

  if (loadingType) {
    return (
      <div style={{ ...pageStyle, textAlign: 'center', paddingTop: '20vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (typeError) {
    return (
      <div style={pageStyle}>
        <WeddingCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={errorIconStyle}>✕</div>
          <Title
            level={3}
            style={{
              fontFamily: "'Italiana', Georgia, serif",
              color: '#7C7458',
              fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
            }}
          >
            Sessió no disponible
          </Title>
          <Text style={bodyTextStyle}>
            Aquesta sessió no existeix o ja no s'ofereix. Tria una sessió des de la pàgina del servei.
          </Text>
          <div>
            <Button type="primary" onClick={() => navigate(AppRoutes.home)} style={{ marginTop: 24 }}>
              Torna a l'inici
            </Button>
          </div>
        </WeddingCard>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Steps
        current={step}
        responsive={false}
        size="small"
        style={{ maxWidth: 600, margin: '0 auto 32px', fontFamily: "'Raleway', sans-serif" }}
        items={[{ title: 'Data i hora' }, { title: 'Les teves dades' }, { title: 'Resum' }, { title: 'Confirmació' }]}
      />

      {submitError && (
        <Alert type="warning" showIcon message={submitError} closable
          onClose={() => setSubmitError(null)} style={{ marginBottom: 24, ...inputStyle }} />
      )}

      {step === 0 && (
        <WeddingCard>
          <WeddingCardHeader
            title={`Reserva ${sessionType!.name}`}
            subtitle={`${groupName} · ${sessionType!.durationMinutes} min`}
          />
          <Row gutter={[24, 24]} style={{ textAlign: 'left' }}>
            <Col xs={24} md={13}>
              <Spin spinning={loadingSlots}>
                <Calendar
                  fullscreen={false}
                  value={selectedDate ?? month}
                  disabledDate={current =>
                    current.isBefore(dayjs(), 'day') || !slotsByDate[current.format('YYYY-MM-DD')]
                  }
                  onSelect={(date, info) => {
                    if (info.source === 'date') {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }
                  }}
                  onPanelChange={newMonth => {
                    setMonth(newMonth);
                    setSelectedDate(null);
                    setSelectedSlot(null);
                  }}
                />
              </Spin>
              {!loadingSlots && !hasAnySlots && (
                <Text style={{ ...bodyTextStyle, display: 'block', textAlign: 'center', marginTop: 8 }}>
                  Cap hora lliure aquest mes. Prova el mes següent.
                </Text>
              )}
            </Col>
            <Col xs={24} md={11}>
              <Text style={{ ...labelStyle, display: 'block', marginBottom: 12 }}>
                {selectedDate
                  ? selectedDate.format('dddd D MMMM')
                  : 'Selecciona un dia al calendari per veure les hores lliures.'}
              </Text>
              <Row gutter={[8, 8]}>
                {selectedDaySlots.map(slot => (
                  <Col key={slot.startAt} xs={8}>
                    <Button
                      block
                      type={selectedSlot?.startAt === slot.startAt ? 'primary' : 'default'}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {dayjs(slot.startAt).format('HH:mm')}
                    </Button>
                  </Col>
                ))}
              </Row>
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <Button type="primary" size="large" disabled={!selectedSlot} onClick={() => setStep(1)}>
                  Següent
                </Button>
              </div>
            </Col>
          </Row>
        </WeddingCard>
      )}

      {step === 1 && (
        <WeddingCard>
          <WeddingCardHeader
            title="Les teves dades"
            subtitle={`${sessionType!.name} · ${dayjs(selectedSlot!.startAt).format('dddd D MMMM YYYY · HH:mm')}`}
          />
          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={values => { setFormValues(values); setStep(2); }}
            initialValues={{ participants: [{ name: '' }] }}
            requiredMark={false}
            style={{ textAlign: 'left', marginTop: 8 }}
          >
            <Form.Item
              name="name"
              label={<span style={labelStyle}>Nom i cognoms</span>}
              rules={[{ required: true, message: 'Escriu el teu nom' }]}
            >
              <Input maxLength={200} style={inputStyle} />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label={<span style={labelStyle}>Telèfon</span>}
                  rules={[{ required: true, message: 'Escriu el teu telèfon' }]}
                >
                  <Input type="tel" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label={<span style={labelStyle}>Email (recomanat per rebre la confirmació)</span>}
                  rules={[{ type: 'email', message: 'Email no vàlid' }]}
                >
                  <Input type="email" style={inputStyle} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dni"
                  label={<span style={labelStyle}>DNI / NIE</span>}
                  rules={[
                    { required: true, message: 'Escriu el teu DNI o NIE' },
                    { pattern: DNI_REGEX, message: 'Format de DNI/NIE no vàlid' },
                  ]}
                >
                  <Input maxLength={9} style={inputStyle} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="address"
                  label={<span style={labelStyle}>Adreça</span>}
                  rules={[{ required: true, message: 'Escriu la teva adreça' }]}
                >
                  <Input maxLength={300} style={inputStyle} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={<span style={labelStyle}>Participants (edat només per menors)</span>} style={{ marginBottom: 8 }}>
              <Form.List
                name="participants"
                rules={[{
                  validator: (_, participants) =>
                    participants?.length ? Promise.resolve() : Promise.reject(new Error('Cal almenys un participant')),
                }]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map(field => (
                      <Row key={field.key} gutter={8}>
                        <Col flex="auto">
                          <Form.Item
                            name={[field.name, 'name']}
                            rules={[{ required: true, message: 'Nom del participant' }]}
                          >
                            <Input placeholder="Nom" maxLength={200} style={inputStyle} />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item name={[field.name, 'age']}>
                            <InputNumber placeholder="Edat" min={0} max={17} style={{ ...inputStyle, width: 90 }} />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Button type="text" danger disabled={fields.length === 1} onClick={() => remove(field.name)}>
                            Treu
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Button type="dashed" block onClick={() => add({ name: '' })} style={inputStyle}>
                      + Afegeix participant
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item
              name="imageRights"
              label={<span style={labelStyle}>Drets d'imatge</span>}
              rules={[{ required: true, message: 'Tria una opció' }]}
            >
              <Radio.Group>
                {IMAGE_RIGHTS_OPTIONS.map(option => (
                  <Radio
                    key={option.value}
                    value={option.value}
                    style={{ display: 'block', marginBottom: 8, fontFamily: "'Raleway', sans-serif" }}
                  >
                    {option.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            <Form.Item name="notes" label={<span style={labelStyle}>Notes (opcional)</span>}>
              <Input.TextArea rows={3} maxLength={1000} style={inputStyle} />
            </Form.Item>

            <Row justify="space-between">
              <Button onClick={() => setStep(0)}>Enrere</Button>
              <Button type="primary" size="large" htmlType="submit">
                Revisar
              </Button>
            </Row>
          </Form>
        </WeddingCard>
      )}

      {step === 2 && formValues && (
        <WeddingCard>
          <WeddingCardHeader
            title="Resum de la reserva"
            subtitle="Revisa les dades abans de confirmar"
          />
          <div style={{ textAlign: 'left', marginTop: 8 }}>
            <SummaryRow label="Sessió" value={`${sessionType!.name} · ${groupName}`} />
            <SummaryRow label="Data i hora" value={dayjs(selectedSlot!.startAt).format('dddd D MMMM YYYY · HH:mm')} />
            <SummaryRow label="Nom i cognoms" value={formValues.name} />
            <SummaryRow label="Telèfon" value={formValues.phone} />
            {formValues.email && <SummaryRow label="Email" value={formValues.email} />}
            <SummaryRow label="DNI / NIE" value={formValues.dni} />
            <SummaryRow label="Adreça" value={formValues.address} />
            <SummaryRow
              label="Participants"
              value={formValues.participants
                .map(p => (p.age != null ? `${p.name} (${p.age} anys)` : p.name))
                .join(', ')}
            />
            <SummaryRow
              label="Drets d'imatge"
              value={IMAGE_RIGHTS_OPTIONS.find(o => o.value === formValues.imageRights)?.label ?? ''}
            />
            {formValues.notes && <SummaryRow label="Notes" value={formValues.notes} />}
          </div>
          <Row justify="space-between" style={{ marginTop: 24 }}>
            <Button onClick={() => setStep(1)}>Enrere</Button>
            <Button type="primary" size="large" onClick={doSubmit} loading={submitting}>
              Confirmar reserva
            </Button>
          </Row>
        </WeddingCard>
      )}

      {step === 3 && result && (
        <WeddingCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={successIconStyle}>✓</div>
          <Title
            level={3}
            style={{
              fontFamily: "'Italiana', Georgia, serif",
              color: '#7C7458',
              fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
            }}
          >
            Reserva confirmada!
          </Title>
          <Text style={{ ...bodyTextStyle, display: 'block' }}>
            {sessionType!.name} · {dayjs(selectedSlot!.startAt).format('dddd D MMMM YYYY · HH:mm')}
            <br />
            A nom de {formValues!.name}
          </Text>
          <Text style={{ ...bodyTextStyle, display: 'block', fontSize: 'clamp(0.8rem, 1.2vw, 0.85rem)', color: '#9a9a9a', marginTop: 16 }}>
            Guarda aquest codi: el necessitaràs per consultar o cancel·lar la reserva.
          </Text>
          <Text copyable strong style={{ fontFamily: "'Raleway', sans-serif", fontSize: '1.1rem' }}>
            {result.confirmationToken}
          </Text>
        </WeddingCard>
      )}
    </div>
  );
};
