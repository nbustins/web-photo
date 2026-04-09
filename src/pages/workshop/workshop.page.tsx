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
          padding: "20px 32px 28px",
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
              margin: "4px 0 20px",
              letterSpacing: "0.05rem",
            }}
          >
            Celebren el primer any de l'estudi
          </p>
        </motion.div>

        {/* Main two-column section */}
        <Row gutter={[40, 32]} align="stretch">
          {/* Left: portrait photo */}
          <Col xs={24} md={10} style={{ display: "flex" }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ flex: 1 }}
            >
              <Placeholder aspect="2/3" style={{ height: "100%", aspectRatio: "unset" }} />
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
                  marginBottom: 14,
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
                  marginBottom: 14,
                }}
              >
                <strong>TALLER:</strong> El taller es fa per grups privats
                d'entre 5 i 10 persones i per torns.
              </p>

              {/* Schedule */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                {scheduleItems.map(({ day, shifts }) => (
                  <div
                    key={day}
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      border: "1px solid #e2ddd7",
                      borderRadius: "0.3rem",
                      padding: "10px 14px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
                        fontWeight: 700,
                        color: "#333",
                        margin: "0 0 6px",
                      }}
                    >
                      {day}
                    </p>
                    <div
                      style={{
                        borderTop: "1px solid #e2ddd7",
                        paddingTop: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {shifts.map((shift, i) => (
                        <div key={shift}>
                          <span
                            style={{
                              display: "block",
                              fontFamily: "Raleway, sans-serif",
                              fontSize: "0.65rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "#a09890",
                              marginBottom: 2,
                            }}
                          >
                            {i === 0 ? "Matí" : "Tarda"}
                          </span>
                          <span
                            style={{
                              fontFamily: "Raleway, sans-serif",
                              fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
                              color: "#444",
                            }}
                          >
                            {shift.replace(/Torn (matí|tarda) de /, "")}
                          </span>
                        </div>
                      ))}
                    </div>
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
          style={{ marginTop: 20 }}
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
