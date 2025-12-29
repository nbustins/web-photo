import React from "react";
import { Col } from "antd";
import { motion } from "framer-motion";
import { radii } from "../styles/tokens/radii";

interface PhotoItemProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.5 } },
};


const PhotoItem: React.FC<PhotoItemProps> = ({ src, alt, style }) => (
  <Col>
    <motion.div variants={itemVariants}>
      <img
        src={src}
        alt = {alt}
        style={{
        width: "100%",
        aspectRatio: "2 / 3",
        overflow: "hidden",
        borderRadius: radii.md,
        ...style,
      }}
      />
    </motion.div>
  </Col>
);

export default PhotoItem;
