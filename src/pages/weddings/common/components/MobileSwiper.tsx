import { FC, useEffect, useRef, useState } from 'react';
import { getPublicPath } from '../../../../utils/pathUtils';

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
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #c2ae95 0%, #ddd4c8 100%)',
      }} />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {sources.map((src, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 100%',
              height: '100%',
              scrollSnapAlign: 'start',
              backgroundImage: `url(${getPublicPath(src)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            role="img"
            aria-label={alt}
          />
        ))}
      </div>

      {sources.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          pointerEvents: 'none',
        }}>
          {sources.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
