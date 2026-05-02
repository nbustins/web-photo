import { FC, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Typography, Divider } from 'antd';
import { radii } from '../../../styles/tokens/radii';

const { Title, Text } = Typography;

export const WeddingCard: FC<MotionProps & { children: ReactNode }> = ({
  children,
  initial = { opacity: 0, y: 30 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.6 },
  ...props
}) => {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: radii.lg,
        padding: 'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px)',
        boxShadow: '0 4px 20px rgba(124, 116, 88, 0.1), 0 0 0 1px rgba(124, 116, 88, 0.05)',
        textAlign: 'center',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface WeddingCardHeaderProps {
  title: string;
  subtitle?: string;
  guestName?: string;
}

export const WeddingCardHeader: FC<WeddingCardHeaderProps> = ({
  title,
  subtitle,
  guestName,
}) => {
  return (
    <div style={{ marginBottom: 8 }}>
      <Title
        level={2}
        style={{
          fontFamily: "'Italiana', Georgia, serif",
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 500,
          color: '#7C7458',
          margin: '0 0 8px 0',
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </Title>
      {subtitle && (
        <Text
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
            fontWeight: 400,
            color: 'rgb(174, 142, 116)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </Text>
      )}
      {guestName && (
        <Text
          style={{
            display: 'block',
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
            fontStyle: 'italic',
            color: '#9a9080',
            marginTop: 16,
          }}
        >
          {guestName}
        </Text>
      )}
      <Divider
        style={{
          border: 'none',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(124, 116, 88, 0.2), transparent)',
          margin: '24px 0',
        }}
      />
    </div>
  );
};
