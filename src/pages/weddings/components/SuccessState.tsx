import { FC } from 'react';
import { Typography } from 'antd';
import { WeddingCard } from './WeddingCard';

const { Title, Text } = Typography;

const iconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #7C7458 0%, #6a6450 100%)',
  color: 'white',
  fontSize: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

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
      <div style={iconStyle}>✓</div>
      <Title
        level={3}
        style={{
          fontFamily: "'Italiana', Georgia, serif",
          color: '#7C7458',
          fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
        }}
      >
        Confirmació rebuda!
      </Title>
      <Text style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
        color: '#6a6a6a',
        lineHeight: 1.7,
      }}>
        {attending
          ? "Gràcies per confirmar la teva assistència. Esperem veure't a la celebració!"
          : 'Ens sap greu que no puguis assistir. Et trobarem a faltar!'}
      </Text>
      <Text style={{
        display: 'block',
        fontSize: 'clamp(0.8rem, 1.2vw, 0.85rem)',
        color: '#9a9a9a',
        marginTop: 16,
      }}>
        Pots tancar aquesta finestra. Si necessites fer algún canvi, contacta amb els nuvis.
      </Text>
    </WeddingCard>
  );
};
