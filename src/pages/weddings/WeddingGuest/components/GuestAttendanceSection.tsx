import { FC } from 'react';
import { Form, Switch, FormInstance, Typography } from 'antd';
import type { InvitationFormValues } from '../WeddingGuestPage.types';
import shared from './GuestShared.module.css';
import styles from './GuestConfirmationForm.module.css';
import mobileStyles from './GuestMobileLayout.module.css';

const { Text } = Typography;

interface GuestAttendanceSectionProps {
  form: FormInstance<InvitationFormValues>;
  /** The mobile sheet uses a fixed guest-name size instead of the fluid one. */
  compact?: boolean;
}

export const GuestAttendanceSection: FC<GuestAttendanceSectionProps> = ({ form, compact }) => (
  <Form.Item
    label={<span className={shared.label}>Qui assistirà a la celebració?</span>}
    className={compact ? mobileStyles.guestsItem : styles.guestsItem}
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
            <Text className={compact ? mobileStyles.guestName : styles.guestName}>
              {form.getFieldValue(['guests', field.name, 'name'])}
            </Text>
            <Form.Item name={[field.name, 'attending']} valuePropName="checked" noStyle>
              <Switch checkedChildren="Vinc" unCheckedChildren="No vinc" />
            </Form.Item>
          </div>
        ))
      }
    </Form.List>
  </Form.Item>
);
