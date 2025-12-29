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
  photoPaths,
  rowStyle,
}: ThreePhotoRowProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Row
        gutter={24}
        justify="center"
        align="middle"
        style={rowStyle}
      >
        <Col>
          <PhotoItem
            src={photoPaths[0]}
            alt="left"
            style={{ width: "340px" }}
          />
        </Col>

        <Col>
          <PhotoItem
            src={photoPaths[1]}
            alt="center"
            style={{ width: "430px" }}
          />
        </Col>

        <Col>
          <PhotoItem
            src={photoPaths[2]}
            alt="right"
            style={{ width: "340px" }}
          />
        </Col>
      </Row>
    </motion.div>
  );
};
