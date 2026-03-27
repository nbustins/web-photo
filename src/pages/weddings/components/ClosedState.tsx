import { FC } from 'react';
import { Typography } from 'antd';
import { WeddingCard } from './WeddingCard';
import './wedding-states.css';

const { Title, Text } = Typography;

export const ClosedState: FC = () => {
  return (
    <WeddingCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="wedding-icon-info">ℹ</div>
      <Title level={3} className="wedding-title">Confirmació tancada</Title>
      <Text className="wedding-text">
        La data límit per confirmar l'assistència ha passat. Si necessites fer algún canvi, si us plau contacta directament amb els nuvis.
      </Text>
    </WeddingCard>
  );
};
