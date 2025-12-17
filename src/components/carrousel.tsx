import { useState, useEffect } from 'react';
import "./components.css"
import { radii } from '../styles/tokens/radii';

interface CarouselProps {
  images: string[];
  visibleCount?: number;
}

const RotatingImageCarousel = ({ images, visibleCount = 3 }: CarouselProps) => {
  // Use local state for the carousel order. Initially it's the same as the original images
  const [carouselImages, setCarouselImages] = useState(images);
  // isAnimating controls whether to animate the slide-out effect
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset carousel if images prop changes
  useEffect(() => {
    setCarouselImages(images);
  }, [images]);

  useEffect(() => {
    // Set an interval to rotate the images every 3 seconds
    const interval = setInterval(() => {
      // Begin the sliding animation by toggling the flag
      setIsAnimating(true);
      // After the animation duration (1s) is done, update the order
      setTimeout(() => {
        setCarouselImages((prevImages) => {
          // Pop first image and push it to the end
          const [first, ...rest] = prevImages;
          return [...rest, first];
        });
        // Reset the animation
        setIsAnimating(false);
      }, 1000); // match this to the CSS transition duration below
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselImages, visibleCount]);

 return (
  <div
    style={{
      width: "100%",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        display: "flex",
        transform: isAnimating
          ? `translateX(-${100 / visibleCount}%)`
          : "translateX(0)",
        transition: isAnimating ? "transform 1s ease-in-out" : "none",
      }}
    >
      {carouselImages.map((image, index) => (
        <div
          key={index}
          style={{
            flex: `0 0 ${100 / visibleCount}%`,
            width: "100%",
            padding: "1em",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "2 / 3", // vertical
              borderRadius: radii.md,
              overflow: "hidden",
            }}
          >
            <img
              src={image}
              alt={`carousel-image-${index}`}
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
