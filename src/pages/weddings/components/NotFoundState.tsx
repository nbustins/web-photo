import { FC } from 'react';
import { Button, Typography } from 'antd';
import { WeddingCard } from './WeddingCard';
import './wedding-states.css';

const { Title, Text } = Typography;

interface NotFoundStateProps {
  onReset: () => void;
}

export const NotFoundState: FC<NotFoundStateProps> = ({ onReset }) => {
  return (
    <WeddingCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="wedding-icon-error">✕</div>
      <Title level={3} className="wedding-title">Convidat no trobat</Title>
      <Text className="wedding-text">
        No hem trobat cap convidat amb aquest codi. Si us plau, verifica el codi i torna-ho a intentar.
      </Text>
      <Button 
        type="primary" 
        onClick={onReset}
        className="wedding-btn"
        style={{ marginTop: 24 }}
      >
        Tornar a introduir codi
      </Button>
    </WeddingCard>
  );
};
