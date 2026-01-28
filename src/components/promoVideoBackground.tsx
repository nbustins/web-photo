import { FC, useRef } from "react";

const VIDEO_URI = "https://res.cloudinary.com/djxytedne/video/upload/v1769615993/promo_video_gdgftp.mp4";
const PROMO_POSTER_URI = "https://res.cloudinary.com/djxytedne/video/upload/so_1,f_auto,q_auto/promo_video_gdgftp.jpg";

type PromoVideoBackgroundProps = {
  height: string;
};

export const PromoVideoBackground: FC<PromoVideoBackgroundProps> = ({
  height,
}) => {
  const bgRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* vídeo difuminat */}
      <video
        ref={bgRef}
        autoPlay
        muted
        playsInline
        loop={false}
        poster={PROMO_POSTER_URI}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(30px)",
          transform: "scale(1.2)",
        }}
        onLoadedMetadata={() => {
          const v = bgRef.current;
          if (!v) return;
          v.currentTime = 0.1;
          v.pause();
        }}
      >
        <source src={VIDEO_URI} />
      </video>

      {/* vídeo principal */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={PROMO_POSTER_URI}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      >
        <source src={VIDEO_URI} />
      </video>
    </div>
  );
};
