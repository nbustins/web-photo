import { FC, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Typography, Divider } from 'antd';
import './wedding-card.css';

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
      className="wedding-card"
      initial={initial}
      animate={animate}
      transition={transition}
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
  guestName 
}) => {
  return (
    <div className="wedding-card-header">
      <Title level={2} className="wedding-title">{title}</Title>
      {subtitle && <Text className="wedding-subtitle">{subtitle}</Text>}
      {guestName && <Text className="wedding-guest-name">{guestName}</Text>}
      <Divider className="wedding-divider" />
    </div>
  );
};
