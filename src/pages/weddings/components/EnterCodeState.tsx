import { FC } from 'react';
import { Input, Button, Space } from 'antd';
import { WeddingCard, WeddingCardHeader } from './WeddingCard';

interface EnterCodeStateProps {
  title: string;
  subtitle?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const EnterCodeState: FC<EnterCodeStateProps> = ({
  title,
  subtitle,
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <WeddingCard>
      <WeddingCardHeader
        title={title}
        subtitle={subtitle}
      />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        marginTop: 24,
      }}>
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: 'clamp(0.85rem, 1.3vw, 0.9rem)',
          fontWeight: 500,
          color: '#5a5a5a',
          letterSpacing: '0.02em',
        }}>
          Introdueix el teu codi d'invitació
        </span>
        <Space.Compact style={{ width: '100%', maxWidth: 300 }}>
          <Input
            size="large"
            placeholder="Codi d'invitació"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onPressEnter={onSubmit}
            style={{
              fontFamily: "'Raleway', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          />
          <Button size="large" type="primary" onClick={onSubmit}>
            Continuar
          </Button>
        </Space.Compact>
      </div>
    </WeddingCard>
  );
};
