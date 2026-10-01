import { FC } from 'react';
import { Form, Switch, Typography } from 'antd';
import type { GuestFormValue } from '../WeddingGuestPage.types';
import styles from './GuestSections.module.css';

const { Text } = Typography;

interface TransportSectionProps {
  guests: GuestFormValue[];
}

export const TransportSection: FC<TransportSectionProps> = ({ guests }) => {
  const attending = guests.map((g, index) => ({ g, index })).filter(({ g }) => g.attending);
  if (attending.length === 0) return null;

  return (
    <section className={styles.section}>
      <p className={styles.label}>Transport a l'hotel</p>
      <p className={styles.muted}>Hi haurà un autobús de la celebració a l'hotel en acabar la festa.</p>
      {attending.map(({ g, index }) => (
        <div key={g.id} className={styles.guestRow}>
          <Text className={styles.guestName}>{g.name}</Text>
          <Form.Item name={['guests', index, 'usesTransportToHotel']} valuePropName="checked" noStyle>
            <Switch checkedChildren="Sí" unCheckedChildren="No" aria-label={`Transport a l'hotel per a ${g.name}`} />
          </Form.Item>
        </div>
      ))}
    </section>
  );
};
