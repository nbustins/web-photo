import { FC } from 'react';
import { Form, Input, InputNumber, Radio, Button, FormInstance } from 'antd';
import { WeddingCard, WeddingCardHeader } from './WeddingCard';
import type { GuestWithWedding } from '../../../model/wedding.types';
import './wedding-states.css';

type FormValues = {
  attending: boolean;
  companions_count?: number;
  companions_names?: string[];
  notes?: string;
};

interface FormStateProps {
  guest: GuestWithWedding;
  form: FormInstance<FormValues>;
  submitting: boolean;
  onFinish: (values: FormValues) => void;
}

export const FormState: FC<FormStateProps> = ({ 
  guest, 
  form, 
  submitting, 
  onFinish 
}) => {
  return (
    <WeddingCard>
      <WeddingCardHeader 
        title="Anna & Joan" 
        subtitle="Confirma la teva assistència"
        guestName={`Hola, ${guest.name}!`}
      />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="wedding-form"
        initialValues={{ attending: true, companions_count: 0 }}
      >
        <Form.Item
          name="attending"
          label={<span className="wedding-label">Assistiràs a la celebració?</span>}
          rules={[{ required: true, message: 'Si us plau, selecciona una opció' }]}
        >
          <Radio.Group className="wedding-radio-group">
            <Radio value={true} className="wedding-radio">
              <span className="wedding-radio-label">Sí, hi seré</span>
            </Radio>
            <Radio value={false} className="wedding-radio">
              <span className="wedding-radio-label">No podré assistir</span>
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.attending !== curr.attending}>
          {({ getFieldValue }) => 
            getFieldValue('attending') === true && (
              <>
                <Form.Item
                  name="companions_count"
                  label={<span className="wedding-label">Nombre de acompanyants (màxim {guest.max_companions})</span>}
                  rules={[
                    { required: true, message: 'Si us plau, indica el nombre de acompanyants' },
                    { type: 'number', min: 0, max: guest.max_companions, message: `El nombre màxim és ${guest.max_companions}` }
                  ]}
                >
                  <InputNumber min={0} max={guest.max_companions} className="wedding-input-number" />
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
                          label={<span className="wedding-label">Nom de l'acompanyant {i + 1}</span>}
                          rules={[{ required: true, message: 'Si us plau, introdueix el nom' }]}
                        >
                          <Input placeholder={`Acompanyant ${i + 1}`} className="wedding-input" />
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
          label={<span className="wedding-label">Observacions (al·lèrgies, menú especial, etc.)</span>}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Escriu les teves observacions aquí..." 
            className="wedding-textarea"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitting}
            className="wedding-btn wedding-btn-submit"
            size="large"
          >
            Confirmar assistència
          </Button>
        </Form.Item>
      </Form>
    </WeddingCard>
  );
};
