import { FC } from 'react';
import { Form, Input, Switch, Button, FormInstance, Typography } from 'antd';
import { WeddingCard, WeddingCardHeader } from './WeddingCard';
import type { Invitation } from '../../../model/wedding.types';
import type { InvitationFormValues } from '../WeddingPage.types';

const { Text } = Typography;

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

const guestRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderRadius: 10,
  border: '1px solid rgba(124, 116, 88, 0.2)',
  marginBottom: 10,
  background: 'rgba(255,255,255,0.6)',
};

interface FormStateProps {
  title: string;
  subtitle?: string;
  invitation: Invitation;
  form: FormInstance<InvitationFormValues>;
  submitting: boolean;
  onFinish: (values: InvitationFormValues) => void;
}

export const FormState: FC<FormStateProps> = ({
  title,
  subtitle,
  invitation,
  form,
  submitting,
  onFinish,
}) => {
  return (
    <WeddingCard>
      <WeddingCardHeader
        title={title}
        subtitle={subtitle}
        guestName={`Hola, ${invitation.label}!`}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ textAlign: 'left', marginTop: 8 }}
      >
        <Form.Item
          label={<span style={labelStyle}>Qui assistirà a la celebració?</span>}
          style={{ marginBottom: 8 }}
        >
          <Form.List name="guests">
            {(fields) =>
              fields.map((field) => (
                <div key={field.key} style={guestRowStyle}>
                  <Form.Item name={[field.name, 'id']} hidden noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name={[field.name, 'name']} hidden noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Text style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)',
                    color: '#333',
                  }}>
                    {form.getFieldValue(['guests', field.name, 'name'])}
                  </Text>
                  <Form.Item
                    name={[field.name, 'attending']}
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch
                      checkedChildren="Vinc"
                      unCheckedChildren="No vinc"
                    />
                  </Form.Item>
                </div>
              ))
            }
          </Form.List>
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
            style={{ width: '100%', marginTop: 8 }}
          >
            Confirmar assistència
          </Button>
        </Form.Item>
      </Form>
    </WeddingCard>
  );
};
