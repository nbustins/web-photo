import { FC } from "react";

type ImageBackgroundProps = {
  height: string;
  imageUrl: string;
};

export const ImageBackground: FC<ImageBackgroundProps> = ({
  height,
  imageUrl,
}) => (
  <div
    style={{
      minHeight: height,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  />
);
