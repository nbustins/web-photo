import { Row, Col } from "antd";
import { motion } from "framer-motion";
import PhotoItem from "./photoComponent";

type ThreePhotoRowProps = {
  photoPaths: [string, string, string];
  rowStyle?: React.CSSProperties;
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
  photoPaths, rowStyle
}: ThreePhotoRowProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Row gutter={[24, 24]} justify="center" align="middle" style={{...rowStyle}}>
        <Col xs={24}  md={{ flex: "0 0 auto" }}>
          <PhotoItem
            src={photoPaths[0]}
            alt="Fotografia newborn esquerra"
            style={{ maxWidth: "340px", width: "100%" }}
          />
        </Col>

        <Col xs={24}  md={{ flex: "0 0 auto" }}>
          <PhotoItem
            src={photoPaths[1]}
            alt="Fotografia newborn central"
            style={{ maxWidth: "430px", width: "100%" }}
          />
        </Col>

        <Col xs={24}  md={{ flex: "0 0 auto" }}>
          <PhotoItem
            src={photoPaths[2]}
            alt="Fotografia newborn dreta"
            style={{ maxWidth: "340px", width: "100%" }}
          />
        </Col>
      </Row>

    </motion.div>
  );
};
