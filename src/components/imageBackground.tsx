import { FC } from "react";
import styles from "./blocks.module.css";

type ImageBackgroundProps = {
  height: string;
  imageUrl: string;
};

export const ImageBackground: FC<ImageBackgroundProps> = ({
  height,
  imageUrl,
}) => (
  <div
    className={styles.imageBackground}
    style={{ minHeight: height, backgroundImage: `url(${imageUrl})` }}
  />
);
