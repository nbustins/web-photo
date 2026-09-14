import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MobileSwiper } from './MobileSwiper';
import styles from './MobileShell.module.css';

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
    <div className={styles.shell}>
      <div className={styles.media}>
        <MobileSwiper images={images} fallbackImage={fallbackImage} alt={alt} />
      </div>

      <motion.div
        initial={false}
        animate={{ maxHeight: expanded ? '80vh' : '45vh' }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        className={styles.sheet}
      >
        <div className={styles.handle} />
        {children}
      </motion.div>
    </div>
  );
};
