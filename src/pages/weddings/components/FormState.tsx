import { FC } from 'react';
import { Form, Input, InputNumber, Radio, Button, FormInstance } from 'antd';
import { WeddingCard, WeddingCardHeader } from './WeddingCard';
import type { GuestWithWedding } from '../../../model/wedding.types';

type FormValues = {
  attending: boolean;
  companions_count?: number;
  companions_names?: string[];
  notes?: string;
};

interface FormStateProps {
  title: string;
  subtitle?: string;
  heroImage?: string;
  guest: GuestWithWedding;
  form: FormInstance<FormValues>;
  submitting: boolean;
  onFinish: (values: FormValues) => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.85rem, 1.3vw, 0.9rem)',
  fontWeight: 500,
  color: '#5a5a5a',
  letterSpacing: '0.02em',
};

const radioStyle: React.CSSProperties = {
  padding: '16px 20px',
  border: '1px solid rgba(124, 116, 88, 0.25)',
  borderRadius: 10,
  transition: 'all 0.2s ease',
  width: '100%',
};

const radioLabelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)',
  color: '#5a5a5a',
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  borderRadius: 8,
};

export const FormState: FC<FormStateProps> = ({
  title,
  subtitle,
  heroImage,
  guest,
  form,
  submitting,
  onFinish,
}) => {
  return (
    <WeddingCard>
      <WeddingCardHeader
        title={title}
        subtitle={subtitle}
        guestName={`Hola, ${guest.name}!`}
        heroImage={heroImage}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ textAlign: 'left', marginTop: 8 }}
        initialValues={{ attending: true, companions_count: 0 }}
      >
        <Form.Item
          name="attending"
          label={<span style={labelStyle}>Assistiràs a la celebració?</span>}
          rules={[{ required: true, message: 'Si us plau, selecciona una opció' }]}
        >
          <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <Radio value={true} style={radioStyle}>
              <span style={radioLabelStyle}>Sí, hi seré</span>
            </Radio>
            <Radio value={false} style={radioStyle}>
              <span style={radioLabelStyle}>No podré assistir</span>
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.attending !== curr.attending}>
          {({ getFieldValue }) =>
            getFieldValue('attending') === true && (
              <>
                <Form.Item
                  name="companions_count"
                  label={<span style={labelStyle}>Nombre de acompanyants (màxim {guest.max_companions})</span>}
                  rules={[
                    { required: true, message: 'Si us plau, indica el nombre de acompanyants' },
                    { type: 'number', min: 0, max: guest.max_companions, message: `El nombre màxim és ${guest.max_companions}` },
                  ]}
                >
                  <InputNumber min={0} max={guest.max_companions} style={{ width: '100%', maxWidth: 120 }} />
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.companions_count !== curr.companions_count}>
                  {({ getFieldValue }) => {
                    const count = getFieldValue('companions_count') || 0;
                    const companionFields = [];
                    for (let i = 0; i < count; i++) {
                      companionFields.push(
                        <Form.Item
                          key={i}
                          name={['companions_names', i]}
                          label={<span style={labelStyle}>Nom de l'acompanyant {i + 1}</span>}
                          rules={[{ required: true, message: 'Si us plau, introdueix el nom' }]}
                        >
                          <Input placeholder={`Acompanyant ${i + 1}`} style={inputStyle} />
                        </Form.Item>
                      );
                    }
                    return <>{companionFields}</>;
                  }}
                </Form.Item>
              </>
            )
          }
        </Form.Item>

        <Form.Item
          name="notes"
          label={<span style={labelStyle}>Observacions (al·lèrgies, menú especial, etc.)</span>}
        >
          <Input.TextArea
            rows={3}
            placeholder="Escriu les teves observacions aquí..."
            style={inputStyle}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            size="large"
            style={{ width: '100%', marginTop: 16 }}
          >
            Confirmar assistència
          </Button>
        </Form.Item>
      </Form>
    </WeddingCard>
  );
};
