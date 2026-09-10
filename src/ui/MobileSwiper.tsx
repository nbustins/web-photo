import { FC, useEffect, useRef, useState } from 'react';
import { imageUrl } from '../utils/pathUtils';
import styles from './MobileSwiper.module.css';

interface MobileSwiperProps {
  images: string[];
  fallbackImage?: string;
  alt?: string;
}

export const MobileSwiper: FC<MobileSwiperProps> = ({ images, fallbackImage, alt = '' }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sources = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handleScroll = () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActiveIndex(index);
    };
    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, []);

  if (sources.length === 0) {
    return <div className={styles.placeholder} />;
  }

  return (
    <div className={styles.root}>
      <div ref={trackRef} className={styles.track}>
        {sources.map((src, i) => (
          <div
            key={i}
            className={styles.slide}
            style={{ backgroundImage: `url(${imageUrl(src)})` }}
            role="img"
            aria-label={alt}
          />
        ))}
      </div>

      {sources.length > 1 && (
        <div className={styles.dots}>
          {sources.map((_, i) => (
            <span
              key={i}
              className={i === activeIndex ? `${styles.dot} ${styles.dotActive}` : styles.dot}
            />
          ))}
        </div>
      )}
    </div>
  );
};
