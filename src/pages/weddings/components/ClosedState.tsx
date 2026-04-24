import { FC } from 'react';
import { Typography } from 'antd';
import { WeddingCard, WeddingCardHeader } from './WeddingCard';

const { Title, Text } = Typography;

const iconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgb(174, 142, 116) 0%, rgb(154, 122, 96) 100%)',
  color: 'white',
  fontSize: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

interface ClosedStateProps {
  title?: string;
  heroImage?: string;
}

export const ClosedState: FC<ClosedStateProps> = ({ title, heroImage }) => {
  return (
    <WeddingCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {title && <WeddingCardHeader title={title} heroImage={heroImage} />}
      <div style={iconStyle}>ℹ</div>
      <Title
        level={3}
        style={{
          fontFamily: "'Italiana', Georgia, serif",
          color: '#7C7458',
          fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
        }}
      >
        Confirmació tancada
      </Title>
      <Text style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
        color: '#6a6a6a',
        lineHeight: 1.7,
      }}>
        La data límit per confirmar l'assistència ha passat. Si necessites fer algún canvi pots tornar a accedir amb el teu codi.
      </Text>
    </WeddingCard>
  );
};
