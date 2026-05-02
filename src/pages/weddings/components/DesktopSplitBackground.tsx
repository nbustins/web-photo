import { FC } from 'react';
import { getPublicPath } from '../../../utils/pathUtils';

interface DesktopSplitBackgroundProps {
  images: string[];
  fallbackImage?: string;
}

export const DesktopSplitBackground: FC<DesktopSplitBackgroundProps> = ({ images, fallbackImage }) => {
  const sources = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  if (sources.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundColor: 'rgb(246, 244, 240)',
      }} />
    );
  }

  const leftImage = sources[0];
  const rightImage = sources[1] ?? sources[0];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      backgroundColor: 'rgb(246, 244, 240)',
    }}>
      {[leftImage, rightImage].map((src, index) => (
        <div
          key={`${src}-${index}`}
          style={{
            backgroundImage: `url(${getPublicPath(src)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(246, 244, 240, 0.18)',
      }} />
    </div>
  );
};
