import { Row, Col } from "antd";
import { motion } from "framer-motion";
import { getPublicPath } from "../../../utils/pathUtils";

const IMAGE_HEIGHT = 500;

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.15,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut"
    }
  }
};

export function ThreePhotoRow() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Row gutter={[24, 24]} justify="center" align="middle" style={{padding : "2rem"}}>
        <Col xs={24} md={7}>
          <motion.img
            variants={itemVariants}
            src={getPublicPath("familiar/1.jpg")}
            alt="Fotografia newborn esquerra"
            style={{
              width: "100%",
              height: IMAGE_HEIGHT,
              objectFit: "cover"
            }}
          />
        </Col>

        <Col xs={24} md={10}>
          <motion.img
            variants={itemVariants}
            src={getPublicPath("familiar/2.jpg")}
            alt="Fotografia newborn central"
            style={{
              width: "100%",
              height: IMAGE_HEIGHT,
              objectFit: "cover"
            }}
          />
        </Col>

        <Col xs={24} md={7}>
          <motion.img
            variants={itemVariants}
            src={getPublicPath("familiar/3.jpg")}
            alt="Fotografia newborn dreta"
            style={{
              width: "100%",
              height: IMAGE_HEIGHT,
              objectFit: "cover"
            }}
          />
        </Col>
      </Row>
    </motion.div>
  );
}
