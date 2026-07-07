import { Typography } from 'antd';
import { WeddingCard } from '../../weddings/common';

const { Title } = Typography;

const iconBase: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  color: 'white',
  fontSize: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

const iconStyle: Record<'success' | 'error', React.CSSProperties> = {
  success: { ...iconBase, background: 'linear-gradient(135deg, #7C7458 0%, #6a6450 100%)' },
  error: { ...iconBase, background: 'linear-gradient(135deg, #a09880 0%, #8a8070 100%)' },
};

interface StatusCardProps {
  variant: 'success' | 'error';
  title: string;
  children: React.ReactNode;
}

/** Animated result card with a round icon: success (✓) or error (✕). */
export const StatusCard = ({ variant, title, children }: StatusCardProps) => (
  <WeddingCard
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div style={iconStyle[variant]}>{variant === 'success' ? '✓' : '✕'}</div>
    <Title
      level={3}
      style={{
        fontFamily: "'Italiana', Georgia, serif",
        color: '#7C7458',
        fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
      }}
    >
      {title}
    </Title>
    {children}
  </WeddingCard>
);
