import { Button, Col, Row } from "antd";
import { motion } from "framer-motion";
import { CustomTitle } from "@components";
import styles from "./workshop.module.css";

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
  "https://docs.google.com/forms/d/e/1FAIpQLSfyVezcLi0cFX52yqKiPdbcY6Ly66BzsoaaaFhTlXmqye4-vQ/viewform?usp=preview";

const heroImage =
  "https://res.cloudinary.com/djxytedne/image/upload/v1775818510/TALLER-22_rbyaxb.jpg";

export const Workshop = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Title */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={styles.titleBlock}
        >
          <CustomTitle label="TALLER" title="BRODA RECORDS" />
        </motion.div>

        {/* Main two-column section */}
        <Row gutter={[40, 32]} align="stretch">
          {/* Left: portrait photo */}
          <Col xs={24} md={10} className={styles.photoColumn}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={styles.photoFill}
            >
              <img src={heroImage} alt="Taller lateral" className={styles.heroImage} />
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
                <p key={i} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}

              {/* TALLER block */}
              <p className={styles.groupNote}>
                El taller es fa per grups privats
                d'entre 5 i 10 persones i per torns.
              </p>

              <div className={styles.shifts}>
                {shifts.map((shift) => (
                  <div key={shift.label} className={styles.shift}>
                    <span className={styles.shiftLabel}>{shift.label}</span>
                    <span className={styles.shiftTime}>{shift.time}</span>
                  </div>
                ))}
              </div>

              {/* PREU */}
              <p className={styles.price}>
                28&nbsp;€ / persona
              </p>

              {/* INCLOU */}
              <div className={styles.includes}>
                <p className={styles.includesLabel}>Inclou</p>
                <ul className={styles.includesList}>
                  {includes.map((item, i) => (
                    <li key={i} className={styles.includesItem}>
                      <span className={styles.dash}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reserva */}
              <div className={styles.bookWrap}>
                <Button
                  type="primary"
                  size="large"
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bookButton}
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
          className={styles.gallery}
        >
          <Row gutter={[16, 16]}>
            {galleryImages.map((src, i) => (
              <Col xs={12} md={6} key={i}>
                <img
                  src={src}
                  alt={`Taller ${i + 1}`}
                  className={styles.galleryImage}
                />
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>
    </div>
  );
};
