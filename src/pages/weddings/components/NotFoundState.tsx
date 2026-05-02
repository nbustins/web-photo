import { FC } from 'react';
import { Button, Typography } from 'antd';
import { WeddingCard, WeddingCardHeader } from './WeddingCard';

const { Text } = Typography;

const iconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #a09880 0%, #8a8070 100%)',
  color: 'white',
  fontSize: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

interface NotFoundStateProps {
  title?: string;
  onReset: () => void;
}

export const NotFoundState: FC<NotFoundStateProps> = ({ title, onReset }) => {
  return (
    <WeddingCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {title && <WeddingCardHeader title={title} />}
      <div style={iconStyle}>✕</div>
      <Typography.Title
        level={3}
        style={{
          fontFamily: "'Italiana', Georgia, serif",
          color: '#7C7458',
          fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
        }}
      >
        Convidat no trobat
      </Typography.Title>
      <Text style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
        color: '#6a6a6a',
        lineHeight: 1.7,
      }}>
        No hem trobat cap convidat amb aquest codi. Si us plau, verifica el codi i torna-ho a intentar.
      </Text>
      <Button
        type="primary"
        onClick={onReset}
        style={{ marginTop: 24 }}
      >
        Tornar a introduir codi
      </Button>
    </WeddingCard>
  );
};
