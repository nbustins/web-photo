import { FC } from 'react';
import { Alert, Form, Input, Switch, Button, FormInstance, Typography } from 'antd';
import { SurfaceCard, SurfaceCardHeader } from '@ui/SurfaceCard';
import type { Invitation } from '../../../../model/wedding.types';
import type { InvitationFormValues } from '../WeddingGuestPage.types';
import shared from './GuestShared.module.css';
import styles from './GuestConfirmationForm.module.css';

const { Text } = Typography;

interface GuestConfirmationFormProps {
  title: string;
  subtitle?: string;
  invitation: Invitation;
  form: FormInstance<InvitationFormValues>;
  submitting: boolean;
  submitError?: string | null;
  onFinish: (values: InvitationFormValues) => void;
}

export const GuestConfirmationForm: FC<GuestConfirmationFormProps> = ({
  title,
  subtitle,
  invitation,
  form,
  submitting,
  submitError,
  onFinish,
}) => {
  return (
    <SurfaceCard>
      <SurfaceCardHeader
        title={title}
        subtitle={subtitle}
        guestName={`Hola, ${invitation.label}!`}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles.form}
      >
        <Form.Item
          label={<span className={shared.label}>Qui assistirà a la celebració?</span>}
          className={styles.guestsItem}
        >
          <Form.List name="guests">
            {(fields) =>
              fields.map((field) => (
                <div key={field.key} className={shared.guestRow}>
                  <Form.Item name={[field.name, 'id']} hidden noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name={[field.name, 'name']} hidden noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Text className={styles.guestName}>
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
          label={<span className={shared.label}>Observacions (al·lèrgies, menú especial, etc.)</span>}
        >
          <Input.TextArea
            rows={3}
            placeholder="Escriu les teves observacions aquí..."
            className={shared.input}
            showCount
            maxLength={500}
          />
        </Form.Item>

        {submitError && (
          <Form.Item>
            <Alert type="warning" showIcon message={submitError} />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            size="large"
            className={styles.submitButton}
          >
            Confirmar assistència
          </Button>
        </Form.Item>
      </Form>
    </SurfaceCard>
  );
};
