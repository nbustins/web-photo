import { useEffect, useRef, useState } from "react";
import { radii } from "../styles/tokens/radii";

interface CarouselProps {
  images: string[];
  visibleCount?: number;
  intervalMs?: number;
  transitionMs?: number;
}

const RotatingImageCarousel = ({
  images,
  visibleCount = 4,
  intervalMs = 2500,
  transitionMs = 800,
}: CarouselProps) => {
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
    <div
      style={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          willChange: "transform",
          transform: `translate3d(-${(100 / visibleCount) * offset}%, 0, 0)`,
          transition:
            offset === 0
              ? "none"
              : `transform ${transitionMs}ms ease-in-out`,
        }}
      >
        {renderItems.map((image, i) => (
          <div
            key={`${image}-${i}`}
            style={{
              flex: `0 0 ${100 / visibleCount}%`,
              padding: "0.35em",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "2 / 3",
                borderRadius: radii.md,
                overflow: "hidden",
              }}
            >
              <img
                src={image}
                alt={`carousel-${i}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RotatingImageCarousel;
