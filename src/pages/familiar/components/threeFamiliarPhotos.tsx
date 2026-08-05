import { Row, Col } from "antd";
import { motion } from "framer-motion";
import { getPublicPath } from "../../../utils/pathUtils";
import styles from "./threeFamiliarPhotos.module.css";

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
      <Row gutter={[24, 24]} justify="center" align="middle" className={styles.row}>
        <Col xs={24} md={7}>
          <motion.img
            variants={itemVariants}
            src={getPublicPath("familiar/1.jpg")}
            alt="Fotografia newborn esquerra"
            className={styles.photo}
          />
        </Col>

        <Col xs={24} md={10}>
          <motion.img
            variants={itemVariants}
            src={getPublicPath("familiar/2.jpg")}
            alt="Fotografia newborn central"
            className={styles.photo}
          />
        </Col>

        <Col xs={24} md={7}>
          <motion.img
            variants={itemVariants}
            src={getPublicPath("familiar/3.jpg")}
            alt="Fotografia newborn dreta"
            className={styles.photo}
          />
        </Col>
      </Row>
    </motion.div>
  );
}
