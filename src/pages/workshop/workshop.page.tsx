import { Button, Col, Row } from "antd";
import { motion } from "framer-motion";
import { CustomTitle } from "../../components/customTitle";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const introParagraphs = [
  "Vols celebrar un aniversari? Passar una bona estona amb amics/amigues o familiars? Una despedida?",
  "Veniu al taller a brodar la vostra pròpia foto!",
  "A l'estudi us ho preparo tot, l'únic que heu de fer és reservar un matí o una tarda contestant el formulari!",
];

const shifts = [
  { label: "Matí", time: "10:30 - 13:00" },
  { label: "Tarda", time: "16:30 - 19:00" },
];

const includes = [
  "Una foto impresa per persona",
  "Un marc de fotos per persona",
  "Tot el material per brodar (fils, agulles, tisores, punxó, etc.)",
  "Berenar o esmorzar",
  "Estudi ambientat en la temàtica (en cas d'aniversari o despedida)",
];

const galleryImages = [
  "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4-3_r0bzip.jpg",
  "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4-2_jicr0x.jpg",
  "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4-4_nqtmlx.jpg",
  "https://res.cloudinary.com/djxytedne/image/upload/v1775818356/TALLER_4_bitwm5.jpg",
];

const bookingUrl =
  "https://docs.google.com/forms/d/1d5KnwhBY1n8aI6SL5pv1cbFb9lnZAKyM5nLcCdeEMHU/preview";

const heroImage =
  "https://res.cloudinary.com/djxytedne/image/upload/v1775818510/TALLER-22_rbyaxb.jpg";

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
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          <CustomTitle label="TALLER" title="BRODA RECORDS" />
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
                src={heroImage}
                alt="Taller lateral"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "0.3rem",
                  display: "block",
                }}
              />
            </motion.div>
          </Col>

          {/* Right: copy + shifts + price + includes + book */}
          <Col xs={24} md={14}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              {/* Intro */}
              {introParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                    color: "#444",
                    lineHeight: 1.75,
                    marginBottom: 12,
                    textAlign: "justify",
                    hyphens: "auto",
                  }}
                >
                  {paragraph}
                </p>
              ))}

              {/* TALLER block */}
              <p
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                  color: "#444",
                  lineHeight: 1.75,
                  marginTop: 18,
                  marginBottom: 12,
                }}
              >
                El taller es fa per grups privats
                d'entre 5 i 10 persones i per torns.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {shifts.map((shift) => (
                  <div
                    key={shift.label}
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      border: "1px solid #e2ddd7",
                      borderRadius: "0.3rem",
                      padding: "12px 14px",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontFamily: "Raleway, sans-serif",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#a09890",
                        marginBottom: 4,
                      }}
                    >
                      {shift.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: "clamp(0.9rem, 1.3vw, 1rem)",
                        color: "#444",
                      }}
                    >
                      {shift.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* PREU */}
              <p
                style={{
                  textAlign: "center",
                  fontFamily: "Italiana, serif",
                  fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
                  color: "#333",
                  letterSpacing: "0.04em",
                  margin: "0 0 20px",
                }}
              >
                28&nbsp;€ / persona
              </p>

              {/* INCLOU */}
              <div style={{ marginBottom: 24 }}>
                <p
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#a09890",
                    margin: "0 0 8px",
                  }}
                >
                  Inclou
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {includes.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                        color: "#444",
                        lineHeight: 1.6,
                        paddingLeft: 16,
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          color: "#a09890",
                        }}
                      >
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reserva */}
              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  size="large"
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0 64px",
                    height: 56,
                    fontSize: "1.1rem",
                    width: "100%",
                  }}
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
          style={{ marginTop: 24 }}
        >
          <Row gutter={[16, 16]}>
            {galleryImages.map((src, i) => (
              <Col xs={12} md={6} key={i}>
                <img
                  src={src}
                  alt={`Taller ${i + 1}`}
                  style={{
                    width: "100%",
                    aspectRatio: "3/2",
                    objectFit: "cover",
                    borderRadius: "0.3rem",
                    display: "block",
                  }}
                />
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>
    </div>
  );
};
