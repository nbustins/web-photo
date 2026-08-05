import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "../ui/hooks";
import styles from "./blocks.module.css";

interface CarouselProps {
  images: string[];
  visibleCount?: number;
  intervalMs?: number;
  transitionMs?: number;
}

const RotatingImageCarousel = ({
  images,
  intervalMs = 2500,
  transitionMs = 800,
}: CarouselProps) => {
  const isMobile = useIsMobile();
  const count = isMobile ? 1 : 4;

  const [items, setItems] = useState(images);
  const [offset, setOffset] = useState(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    setItems(images);
    setOffset(0);
  }, [images]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (animatingRef.current) return;

      animatingRef.current = true;
      setOffset(1);

      setTimeout(() => {
        setItems((prev) => {
          const [first, ...rest] = prev;
          return [...rest, first];
        });

        // reset invisible
        setOffset(0);
        animatingRef.current = false;
      }, transitionMs);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, transitionMs]);

  // buffer visual
  const renderItems = [...items, items[0]];

  return (
    <div className={styles.carousel}>
      <div
        className={styles.carouselTrack}
        style={{
          transform: `translate3d(-${(100 / count) * offset}%, 0, 0)`,
          transition:
            offset === 0
              ? "none"
              : `transform ${transitionMs}ms ease-in-out`,
        }}
      >
        {renderItems.map((image, i) => (
          <div
            key={`${image}-${i}`}
            className={styles.carouselSlot}
            style={{ "--carousel-count": count } as React.CSSProperties}
          >
            <div className={styles.carouselFrame}>
              <img src={image} alt={`carousel-${i}`} className={styles.carouselImage} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RotatingImageCarousel;
