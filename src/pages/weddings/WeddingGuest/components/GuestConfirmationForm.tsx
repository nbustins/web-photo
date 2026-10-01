import { FC } from 'react';
import { Alert, Form, Button, FormInstance } from 'antd';
import { SurfaceCard, SurfaceCardHeader } from '@ui/SurfaceCard';
import type { Invitation } from '../../../../model/wedding.types';
import type { InvitationFormValues } from '../WeddingGuestPage.types';
import { GuestFormFields } from './GuestFormFields';
import styles from './GuestConfirmationForm.module.css';

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
        <GuestFormFields invitation={invitation} form={form} />

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
