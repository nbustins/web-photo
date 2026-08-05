import { FC } from 'react';
import { Input, Button, Space } from 'antd';
import { SurfaceCard, SurfaceCardHeader } from '@ui/SurfaceCard';
import shared from './GuestShared.module.css';
import styles from './GuestStates.module.css';

interface GuestCodeEntryProps {
  title: string;
  subtitle?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const GuestCodeEntry: FC<GuestCodeEntryProps> = ({
  title,
  subtitle,
  value,
  onChange,
  onSubmit,
}) => (
  <SurfaceCard>
    <SurfaceCardHeader title={title} subtitle={subtitle} />
    <div className={styles.codeBlock}>
      <span className={shared.label}>Introdueix el teu codi d'invitació</span>
      <Space.Compact className={styles.codeField}>
        <Input
          size="large"
          placeholder="Codi d'invitació"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onPressEnter={onSubmit}
          className={shared.codeInput}
        />
        <Button size="large" type="primary" onClick={onSubmit}>
          Continuar
        </Button>
      </Space.Compact>
    </div>
  </SurfaceCard>
);
