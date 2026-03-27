import { FC } from 'react';
import { Typography } from 'antd';
import { WeddingCard } from './WeddingCard';
import './wedding-states.css';

const { Title, Text } = Typography;

interface SuccessStateProps {
  attending: boolean;
}

export const SuccessState: FC<SuccessStateProps> = ({ attending }) => {
  return (
    <WeddingCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="wedding-icon-success">✓</div>
      <Title level={3} className="wedding-title">Confirmació rebuda!</Title>
      <Text className="wedding-text">
        {attending
          ? "Gràcies per confirmar la teva assistència. Esperem veure't a la celebració!"
          : 'Ens sap greu que no puguis assistir. Et trobarem a faltar!'}
      </Text>
      <Text className="wedding-text wedding-text-small">
        Pots tancar aquesta finestra. Si necessites fer algún canvi, contacta amb els nuvis.
      </Text>
    </WeddingCard>
  );
};
