import { Col, Row, Typography } from "antd";
import { motion } from "framer-motion";
import { getPublicPath } from "../../utils/pathUtils";
import { AboutMeTitle } from "./components/aboutmeTitle";
import { useIsMobile } from "../../ui/hooks/useIsMobile";
import styles from "./aboutme.module.css";

const { Text } = Typography;

const textPresentation = () => (
  <p>
    Estic molt contenta que hagis arribat fins aquí, per saber més de mi i de
    l’estudi! La meva passió és poder crear històries de les vostres etapes de
    la vida des d’un enfoc autèntic, natural i emocional, i sempre darrere de la
    càmera. Fa dos anys que vaig emprendre el viatge de crear el meu propi
    estudi de fotografia, amb la sort de poder-ho fer a Vidreres, el poble que
    m’ha vist créixer.
  </p>
);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

export const AboutMe = () => {
  const isMobile = useIsMobile();

  return (
    <div className={styles.page}>
      {/* Contenidor central */}
      <div className={styles.container}>
        <Row align="middle">
          {/* Columna text */}
          <Col xs={24} md={14} className={styles.textColumn}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={styles.titleBlock}
            >
              <AboutMeTitle label="Hola!" title="Soc la LAURA" />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={styles.textBlock}
            >
              <Text className={styles.presentation}>
                {textPresentation()}
              </Text>
            </motion.div>
          </Col>

          {/* Columna imatge */}
          <Col xs={24} md={10} className={styles.imageColumn}>
            <motion.img
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              src={getPublicPath("aboutme/1.jpg")}
              alt="Giftcard 1"
              className={styles.portrait}
            />
            {/* Imatge sobreposada */}
            {!isMobile && 
            <img
              src={getPublicPath("aboutme/logo.png")}
              alt="Overlay"
              className={styles.logoOverlay}
            />}
          </Col>
        </Row>
      </div>
    </div>
  );
};
