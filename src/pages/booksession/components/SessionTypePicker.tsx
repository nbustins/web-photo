import { Select, Typography } from 'antd';
import { SurfaceCard, SurfaceCardHeader } from '@ui/SurfaceCard';
import { BookableSessionGroup, sessionDisplayName } from '../../../services/booking/booking.api';
import styles from './SessionTypePicker.module.css';

interface SessionTypePickerProps {
  groups: BookableSessionGroup[];
  value: number | undefined;
  onChange: (sessionTypeId: number) => void;
}

export const SessionTypePicker = ({ groups, value, onChange }: SessionTypePickerProps) => (
  <SurfaceCard>
    <SurfaceCardHeader title="Selecciona una sessió" />
    <Select
      className={styles.select}
      size="large"
      placeholder="Tria un tipus de sessió"
      value={value}
      onChange={onChange}
      showSearch
      optionFilterProp="label"
      options={groups.map(group => ({
        label: group.name,
        options: group.sessionTypes.map(type => ({
          value: type.id,
          label: sessionDisplayName(group.name, type.name),
        })),
      }))}
    />
    {!value && (
      <Typography.Text className={styles.hint}>
        Selecciona una sessió per veure les hores lliures.
      </Typography.Text>
    )}
  </SurfaceCard>
);
