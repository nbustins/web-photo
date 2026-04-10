import { Button, Col, Row } from "antd";
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
            Celebrem el primer any de l'estudi
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
              <img
                src="https://res.cloudinary.com/djxytedne/image/upload/v1775818510/TALLER-22_rbyaxb.jpg"
                alt="Taller lateral"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.3rem", display: "block" }}
              />
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
                Vine amb el teu grup d'amics o amigues, amb la teva família 
                o amb qui tinguis ganes de passar una bona estona a fer un taller 
                per brodar la vostra pròpia fotografia.
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

              {/* Reserva button */}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Button
                  type="primary"
                  size="large"
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfyVezcLi0cFX52yqKiPdbcY6Ly66BzsoaaaFhTlXmqye4-vQ/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "0 64px", height: 56, fontSize: "1.1rem", width: "100%" }}
                >
                  Reserva
                </Button>
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
            {[
              "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4-3_r0bzip.jpg",
              "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4-2_jicr0x.jpg",
              "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4-4_nqtmlx.jpg",
              "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4_bitwm5.jpg",
            ].map((src, i) => (
              <Col xs={12} md={6} key={i}>
                <img
                  src={src}
                  alt={`Taller ${i + 1}`}
                  style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", borderRadius: "0.3rem", display: "block" }}
                />
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>
    </div>
  );
};
