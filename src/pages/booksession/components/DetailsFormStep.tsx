import { Button, Col, Form, Input, InputNumber, Radio, Row } from 'antd';
import dayjs from 'dayjs';
import { SurfaceCard, SurfaceCardHeader } from '@ui/SurfaceCard';
import { AvailabilitySlot, BookableSessionType, sessionDisplayName } from '../../../services/booking/booking.api';
import { FormValues, IMAGE_RIGHTS_OPTIONS } from '../types';
import styles from './DetailsFormStep.module.css';

const DNI_REGEX = /^(\d{8}[A-Za-z]|[XYZxyz]\d{7}[A-Za-z])$/;

interface DetailsFormStepProps {
  sessionType: BookableSessionType;
  groupName: string;
  slot: AvailabilitySlot;
  /** Previously entered values, restored when the user navigates back to this step. */
  initialValues: FormValues | null;
  onBack: () => void;
  onSubmit: (values: FormValues) => void;
}

export const DetailsFormStep = ({ sessionType, groupName, slot, initialValues, onBack, onSubmit }: DetailsFormStepProps) => (
  <SurfaceCard>
    <SurfaceCardHeader
      title="Les teves dades"
      subtitle={`${sessionDisplayName(groupName, sessionType.name)} · ${dayjs(slot.startAt).format('dddd D MMMM YYYY · HH:mm')}`}
    />
    <Form<FormValues>
      layout="vertical"
      onFinish={onSubmit}
      initialValues={initialValues ?? { participants: [{ name: '' }] }}
      requiredMark={false}
      className={styles.form}
    >
      <Form.Item
        name="name"
        label={<span className={styles.label}>Nom i cognoms</span>}
        rules={[{ required: true, message: 'Escriu el teu nom' }]}
      >
        <Input maxLength={200} className={styles.input} />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label={<span className={styles.label}>Telèfon</span>}
            rules={[{ required: true, message: 'Escriu el teu telèfon' }]}
          >
            <Input type="tel" className={styles.input} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label={<span className={styles.label}>Email</span>}
            rules={[
              { required: true, message: 'Escriu el teu email' },
              { type: 'email', message: 'Email no vàlid' },
            ]}
          >
            <Input type="email" className={styles.input} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="dni"
            label={<span className={styles.label}>DNI / NIE</span>}
            rules={[
              { required: true, message: 'Escriu el teu DNI o NIE' },
              { pattern: DNI_REGEX, message: 'Format de DNI/NIE no vàlid' },
            ]}
          >
            <Input maxLength={9} className={styles.input} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="address"
            label={<span className={styles.label}>Adreça</span>}
            rules={[{ required: true, message: 'Escriu la teva adreça' }]}
          >
            <Input maxLength={300} className={styles.input} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label={<span className={styles.label}>Participants (edat només per menors)</span>} className={styles.participantsItem}>
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
                      <Input placeholder="Nom" maxLength={200} className={styles.input} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name={[field.name, 'age']}>
                      <InputNumber placeholder="Edat" min={0} max={17} className={styles.ageInput} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button type="text" danger disabled={fields.length === 1} onClick={() => remove(field.name)}>
                      Treu
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button type="dashed" block onClick={() => add({ name: '' })} className={styles.addParticipant}>
                + Afegeix participant
              </Button>
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item
        name="imageRights"
        label={<span className={styles.label}>Drets d'imatge</span>}
        rules={[{ required: true, message: 'Tria una opció' }]}
      >
        <Radio.Group>
          {IMAGE_RIGHTS_OPTIONS.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              className={styles.radioOption}
            >
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>

      <Form.Item name="notes" label={<span className={styles.label}>Notes (opcional)</span>}>
        <Input.TextArea rows={3} maxLength={1000} className={styles.input} />
      </Form.Item>

      <Row justify="space-between">
        <Button onClick={onBack}>Enrere</Button>
        <Button type="primary" size="large" htmlType="submit">
          Revisar
        </Button>
      </Row>
    </Form>
  </SurfaceCard>
);
