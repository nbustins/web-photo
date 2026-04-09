import { Col, Row } from "antd";
import { motion } from "framer-motion";
import { CustomTitle } from "../../components/customTitle";


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const scheduleItems = [
  {
    day: "Divendres 1/5:",
    shifts: ["Torn matí de 10:30 - 13:00", "Torn tarda de 16:30 - 19:00"],
  },
  {
    day: "Dissabte 2/5:",
    shifts: ["Torn matí de 10:30 - 13:00", "Torn tarda de 16:30 - 19:00"],
  },
  {
    day: "Diumenge 3/5:",
    shifts: ["Torn matí de 10:30 - 13:00", "Torn tarda de 16:30 - 19:00"],
  },
  {
    day: "Dissabte 9/5:",
    shifts: ["Torn matí de 10:30 - 13:00", "Torn tarda de 16:30 - 19:00"],
  },
];

const Placeholder = ({
  aspect = "2/3",
  style = {},
}: {
  aspect?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      width: "100%",
      aspectRatio: aspect,
      backgroundColor: "#d9d4cc",
      borderRadius: "0.3rem",
      ...style,
    }}
  />
);

export const Workshop = () => {
  return (
    <div style={{ backgroundColor: "rgb(246,244,240)", minHeight: "100%" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 32px 64px",
        }}
      >
        {/* Title */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 8 }}
        >
          <CustomTitle label="TALLER" title="BRODA RECORDS" />
          <p
            style={{
              fontFamily: "Italiana, serif",
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              color: "#666",
              fontStyle: "italic",
              margin: "4px 0 40px",
              letterSpacing: "0.05rem",
            }}
          >
            Celebren el primer any de l'estudi
          </p>
        </motion.div>

        {/* Main two-column section */}
        <Row gutter={[40, 32]} align="top">
          {/* Left: portrait photo */}
          <Col xs={24} md={10}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Placeholder aspect="2/3" />
            </motion.div>
          </Col>

          {/* Right: text + schedule */}
          <Col xs={24} md={14}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              {/* Intro paragraph */}
              <p
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                  color: "#444",
                  lineHeight: 1.75,
                  marginBottom: 28,
                  textAlign: "justify",
                  hyphens: "auto",
                }}
              >
                L'estudi fa un any i vull celebrar-ho amb tots/es vosaltres!
                Vine amb el teu grup d'amics o amigues, amb la teva familia o
                amb qui tinguis ganes de pasar una bona estona a fer un taller
                per brodar la vostra propia fotografia.
              </p>

              {/* Taller note */}
              <p
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                  color: "#444",
                  lineHeight: 1.75,
                  marginBottom: 28,
                }}
              >
                <strong>TALLER:</strong> El taller es fa per grups privats
                d'entre 5 i 10 persones i per torns.
              </p>

              {/* Schedule */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {scheduleItems.map(({ day, shifts }) => (
                  <div key={day}>
                    <p
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
                        color: "#333",
                        marginBottom: 4,
                      }}
                    >
                      <strong>{day}</strong>
                    </p>
                    {shifts.map((shift) => (
                      <p
                        key={shift}
                        style={{
                          fontFamily: "Raleway, sans-serif",
                          fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
                          color: "#555",
                          margin: "0 0 2px 24px",
                        }}
                      >
                        {shift}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* Bottom: four photos */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ marginTop: 56 }}
        >
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((i) => (
              <Col xs={12} md={6} key={i}>
                <Placeholder aspect="3/2" />
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>
    </div>
  );
};
