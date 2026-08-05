import { FC } from "react";
import { getPublicPath } from "../utils/pathUtils";
import { useIsMobile } from "../ui/hooks";

const uris = [
  {
    video : "https://res.cloudinary.com/djxytedne/video/upload/v1769883265/V%C3%8DDEO_WEB_MOBIL_d4gpgr.mp4",
    poster : "https://res.cloudinary.com/djxytedne/video/upload/so_1,f_auto,q_auto/V%C3%8DDEO_WEB_MOBIL_d4gpgr.mp4"
  },
  {
    video : "https://res.cloudinary.com/djxytedne/video/upload/v1769883183/V%C3%8DDEO_WEB_pdy1bw.mp4",
    poster : "https://res.cloudinary.com/djxytedne/video/upload/so_1,f_auto,q_auto/V%C3%8DDEO_WEB_pdy1bw.mp4"
  },
]


type PromoVideoBackgroundProps = {
  height: string;
};

export const PromoVideoBackground: FC<PromoVideoBackgroundProps> = ({
  height,
}) => {

  const isMobile = useIsMobile();

  const video_data = isMobile
    ? uris[0]
    : uris[1];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        background: "#000",
        backgroundImage: `url(${getPublicPath("main/fons_video.jpg")})`,
      }}
    >

      {/* vídeo principal */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={video_data.poster}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      >
        <source src={video_data.video} />
      </video>
    </div>
  );
};
