import React from "react";
import { Col } from "antd";
import { motion } from "framer-motion";

interface PhotoItemProps {
  src: string;
  alt: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.5 } },
};


const PhotoItem: React.FC<PhotoItemProps> = ({ src, alt }) => (
  <Col xs={24} sm={12} md={8}>
    <motion.div variants={itemVariants}>
      <img
        src={src}
        alt = {alt}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          padding : "0.1em",
          borderRadius : "1.5em",
        }}
      />
    </motion.div>
  </Col>
);

export default PhotoItem;
