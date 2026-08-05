import { FC, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Typography, Divider } from 'antd';
import styles from './SurfaceCard.module.css';

const { Title, Text } = Typography;

export const SurfaceCard: FC<MotionProps & { children: ReactNode }> = ({
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
      className={styles.card}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface SurfaceCardHeaderProps {
  title: string;
  subtitle?: string;
  guestName?: string;
}

export const SurfaceCardHeader: FC<SurfaceCardHeaderProps> = ({
  title,
  subtitle,
  guestName,
}) => {
  return (
    <div className={styles.header}>
      <Title level={2} className={styles.title}>
        {title}
      </Title>
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      {guestName && <Text className={styles.guestName}>{guestName}</Text>}
      <Divider className={styles.divider} />
    </div>
  );
};
