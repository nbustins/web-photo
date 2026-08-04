import { Select, Typography } from 'antd';
import { GlassCard, GlassCardHeader } from '../../../components/glassCard';
import { BookableSessionGroup, sessionDisplayName } from '../../../services/booking/booking.api';
import { bodyTextStyle, inputStyle } from '../styles';

interface SessionTypePickerProps {
  groups: BookableSessionGroup[];
  value: number | undefined;
  onChange: (sessionTypeId: number) => void;
}

export const SessionTypePicker = ({ groups, value, onChange }: SessionTypePickerProps) => (
  <GlassCard>
    <GlassCardHeader title="Selecciona una sessió" />
    <Select
      style={{ ...inputStyle, width: '100%', maxWidth: 420 }}
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
      <Typography.Text style={{ ...bodyTextStyle, display: 'block', marginTop: 16 }}>
        Selecciona una sessió per veure les hores lliures.
      </Typography.Text>
    )}
  </GlassCard>
);
