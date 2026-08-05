import { FC } from 'react';
import { getPublicPath } from '../utils/pathUtils';
import styles from './DesktopSplitBackground.module.css';

interface DesktopSplitBackgroundProps {
  images: string[];
  fallbackImage?: string;
}

export const DesktopSplitBackground: FC<DesktopSplitBackgroundProps> = ({ images, fallbackImage }) => {
  const sources = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  if (sources.length === 0) {
    return <div className={styles.plain} />;
  }

  const leftImage = sources[0];
  const rightImage = sources[1] ?? sources[0];

  return (
    <div className={styles.split}>
      {[leftImage, rightImage].map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={styles.half}
          style={{ backgroundImage: `url(${getPublicPath(src)})` }}
        />
      ))}
      <div className={styles.veil} />
    </div>
  );
};
