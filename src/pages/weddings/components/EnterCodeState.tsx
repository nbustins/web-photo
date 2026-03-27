import { FC } from 'react';
import { Input, Button, Space } from 'antd';
import { WeddingCard, WeddingCardHeader } from './WeddingCard';
import './wedding-states.css';

interface EnterCodeStateProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const EnterCodeState: FC<EnterCodeStateProps> = ({ 
  value, 
  onChange, 
  onSubmit 
}) => {
  return (
    <WeddingCard>
      <WeddingCardHeader 
        title="Anna & Joan" 
        subtitle="Confirma la teva assistència" 
      />
      <div className="wedding-code-form">
        <span className="wedding-label">Introdueix el teu codi d'invitació</span>
        <Space.Compact style={{ width: '100%', maxWidth: 300 }}>
          <Input
            size="large"
            placeholder="Codi d'invitació"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onPressEnter={onSubmit}
            className="wedding-code-input"
          />
          <Button size="large" type="primary" onClick={onSubmit} className="wedding-code-btn">
            Continuar
          </Button>
        </Space.Compact>
      </div>
    </WeddingCard>
  );
};
