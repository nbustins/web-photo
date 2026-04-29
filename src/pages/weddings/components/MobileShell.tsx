import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MobileSwiper } from './MobileSwiper';

interface MobileShellProps {
  images?: string[];
  fallbackImage?: string;
  alt?: string;
  expanded?: boolean;
  children: ReactNode;
}

export const MobileShell: FC<MobileShellProps> = ({
  images = [],
  fallbackImage,
  alt,
  expanded = false,
  children,
}) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#f5f0ea',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <MobileSwiper images={images} fallbackImage={fallbackImage} alt={alt} />
      </div>

      <motion.div
        initial={false}
        animate={{ maxHeight: expanded ? '80vh' : '45vh' }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        style={{
          position: 'relative',
          marginTop: -28,
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -6px 24px rgba(124, 116, 88, 0.12)',
          padding: '24px 22px calc(24px + env(safe-area-inset-bottom)) 22px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{
          width: 44,
          height: 4,
          borderRadius: 2,
          background: 'rgba(124, 116, 88, 0.25)',
          margin: '0 auto 18px',
        }} />
        {children}
      </motion.div>
    </div>
  );
};
