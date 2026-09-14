import React from "react";
import { Col } from "antd";
import { motion } from "framer-motion";
import styles from "./blocks.module.css";

interface PhotoItemProps {
  src: string;
  alt: string;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.5 } },
};

const PhotoItem: React.FC<PhotoItemProps> = ({ src, alt, className }) => (
  <Col>
    <motion.div variants={itemVariants}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className ? `${styles.photo} ${className}` : styles.photo}
      />
    </motion.div>
  </Col>
);

export default PhotoItem;
