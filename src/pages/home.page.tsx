import { FC, useEffect, useState } from "react";

export const HomePage: FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const bgImage = isMobile
    ? "url(photos/beb-mobile.png)" // your mobile image
    : "url(photos/beb.png)";      // your desktop image

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundImage: bgImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxSizing: 'border-box',
      }}
    />
  );
};
