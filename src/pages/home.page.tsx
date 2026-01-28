import { FC, useEffect, useState } from "react";
import { ImageBackground } from "../components/imageBackground";
import { PromoVideoBackground } from "../components/promoVideoBackground";
import { getPublicPath } from "../utils/pathUtils";

export const HomePage: FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const height = "calc(100vh - 180px)";

  const bgImage = isMobile
    ? getPublicPath("main/main.jpg")
    : getPublicPath("main/main.jpg");

  const promoEnabled = true; // ← QUAN ACABI LA PROMO: false

  return promoEnabled ? (
    <PromoVideoBackground height={height} />
  ) : (
    <ImageBackground height={height} imageUrl={bgImage} />
  );
};
