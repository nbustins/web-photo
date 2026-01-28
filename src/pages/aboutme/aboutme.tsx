import { Col, Row, Typography } from "antd";
import { motion } from "framer-motion";
import { getPublicPath } from "../../utils/pathUtils";
import { AboutMeTitle } from "./components/aboutmeTitle";

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
  return (
    <div style={{ backgroundColor: "rgb(246,244,240)" }}>
      {/* Contenidor central */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "10px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "0rem",
        }}
      >
        <Row align="middle">
          {/* Columna text */}
          <Col xs={24} md={14} style={{ paddingRight: "4rem" }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ maxWidth: 700 }}
            >
              <AboutMeTitle label="Hola!" title="Soc la LAURA" />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ maxWidth: 600 }}
            >
              <Text
                style={{
                  fontSize: "1.2rem",
                  color: "rgb(174,142,116)",
                  textAlign: "justify",
                  display: "block",
                  hyphens: "auto",
                  fontWeight: "400",
                }}
              >
                {textPresentation()}
              </Text>
            </motion.div>
          </Col>

          {/* Columna imatge */}
          <Col xs={24} md={10} style={{ marginTop: 40 }}>
            <motion.img
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              src={getPublicPath("aboutme/1.jpg")}
              alt="Giftcard 1"
              style={{
                width: "100%",
                maxWidth: 450,
                height: "auto",
                display: "block",
                margin: "0 auto",
                borderTopLeftRadius: 200,
                borderTopRightRadius: 200,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

