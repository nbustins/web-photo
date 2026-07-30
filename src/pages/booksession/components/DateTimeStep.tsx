import { Button, Calendar, Col, Row, Spin, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { WeddingCard, WeddingCardHeader } from '../../weddings/common';
import { AvailabilitySlot, BookableSessionType, sessionDisplayName } from '../../../services/booking/booking.api';
import { bodyTextStyle, labelStyle } from '../styles';

interface DateTimeStepProps {
  sessionType: BookableSessionType;
  groupName: string;
  month: Dayjs;
  onMonthChange: (month: Dayjs) => void;
  slotsByDate: Record<string, AvailabilitySlot[]>;
  loadingSlots: boolean;
  selectedDate: Dayjs | null;
  onDateChange: (date: Dayjs | null) => void;
  selectedSlot: AvailabilitySlot | null;
  onSlotChange: (slot: AvailabilitySlot | null) => void;
  onNext: () => void;
}

export const DateTimeStep = ({
  sessionType, groupName, month, onMonthChange, slotsByDate, loadingSlots,
  selectedDate, onDateChange, selectedSlot, onSlotChange, onNext,
}: DateTimeStepProps) => {
  const hasAnySlots = Object.keys(slotsByDate).length > 0;
  const selectedDaySlots = selectedDate ? slotsByDate[selectedDate.format('YYYY-MM-DD')] ?? [] : [];

  return (
    <WeddingCard>
      <WeddingCardHeader
        title={`Reserva ${sessionDisplayName(groupName, sessionType.name)}`}
        subtitle={`${sessionType.durationMinutes} min`}
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
                  onDateChange(date);
                  onSlotChange(null);
                }
              }}
              onPanelChange={newMonth => {
                onMonthChange(newMonth);
                onDateChange(null);
                onSlotChange(null);
              }}
            />
          </Spin>
          {!loadingSlots && !hasAnySlots && (
            <Typography.Text style={{ ...bodyTextStyle, display: 'block', textAlign: 'center', marginTop: 8 }}>
              Cap hora lliure aquest mes. Prova el mes següent.
            </Typography.Text>
          )}
        </Col>
        <Col xs={24} md={11}>
          <Typography.Text style={{ ...labelStyle, display: 'block', marginBottom: 12 }}>
            {selectedDate
              ? selectedDate.format('dddd D MMMM')
              : 'Selecciona un dia al calendari per veure les hores lliures.'}
          </Typography.Text>
          <Row gutter={[8, 8]}>
            {selectedDaySlots.map(slot => (
              <Col key={slot.startAt} xs={8}>
                <Button
                  block
                  type={selectedSlot?.startAt === slot.startAt ? 'primary' : 'default'}
                  onClick={() => onSlotChange(slot)}
                >
                  {dayjs(slot.startAt).format('HH:mm')}
                </Button>
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button type="primary" size="large" disabled={!selectedSlot} onClick={onNext}>
              Següent
            </Button>
          </div>
        </Col>
      </Row>
    </WeddingCard>
  );
};
