import { Button, Col, Form, Input, InputNumber, Radio, Row } from 'antd';
import dayjs from 'dayjs';
import { WeddingCard, WeddingCardHeader } from '../../weddings/common';
import { AvailabilitySlot, BookableSessionType, sessionDisplayName } from '../../../services/booking/booking.api';
import { FormValues, IMAGE_RIGHTS_OPTIONS } from '../types';
import { inputStyle, labelStyle } from '../styles';

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
  <WeddingCard>
    <WeddingCardHeader
      title="Les teves dades"
      subtitle={`${sessionDisplayName(groupName, sessionType.name)} · ${dayjs(slot.startAt).format('dddd D MMMM YYYY · HH:mm')}`}
    />
    <Form<FormValues>
      layout="vertical"
      onFinish={onSubmit}
      initialValues={initialValues ?? { participants: [{ name: '' }] }}
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
        <Button onClick={onBack}>Enrere</Button>
        <Button type="primary" size="large" htmlType="submit">
          Revisar
        </Button>
      </Row>
    </Form>
  </WeddingCard>
);
