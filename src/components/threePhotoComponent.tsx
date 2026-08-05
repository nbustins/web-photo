import { Row, Col } from "antd";
import { motion } from "framer-motion";
import PhotoItem from "./photoComponent";
import styles from "./blocks.module.css";

type ThreePhotoRowProps = {
  photoPaths: [string, string, string];
  rowClassName?: string;
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // delay between children
    },
  },
};

export const ThreePhotoRow = ({
  photoPaths, rowClassName
}: ThreePhotoRowProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Row gutter={[24, 24]} justify="center" align="middle" className={rowClassName}>
        <Col xs={24} md={{ flex: "0 0 auto" }}>
          <PhotoItem
            src={photoPaths[0]}
            alt="Fotografia newborn esquerra"
            className={styles.photoSide}
          />
        </Col>

        <Col xs={24} md={{ flex: "0 0 auto" }}>
          <PhotoItem
            src={photoPaths[1]}
            alt="Fotografia newborn central"
            className={styles.photoCenter}
          />
        </Col>

        <Col xs={24} md={{ flex: "0 0 auto" }}>
          <PhotoItem
            src={photoPaths[2]}
            alt="Fotografia newborn dreta"
            className={styles.photoSide}
          />
        </Col>
      </Row>

    </motion.div>
  );
};
