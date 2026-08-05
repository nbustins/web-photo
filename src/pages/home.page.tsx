import { FC } from "react";
import { ImageBackground, PromoVideoBackground } from "@components";
import { getPublicPath } from "../utils/pathUtils";
import { useIsMobile } from "@ui/hooks";

export const HomePage: FC = () => {
  const isMobile = useIsMobile();

  const height = "calc(100vh - 180px)";

  const bgImage = isMobile
    ? getPublicPath("main/main.jpg")
    : getPublicPath("main/main.jpg");

  const promoEnabled = false; 

  return promoEnabled ? (
    <PromoVideoBackground height={height} />
  ) : (
    <ImageBackground height={height} imageUrl={bgImage} />
  );
};
