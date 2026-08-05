import { Col, Row, Typography } from "antd";
import { CustomTitle } from "@components";
import { getPublicPath } from "../../utils/pathUtils";
import { StoreBook, StoreBookProps } from "./components/storeBook";
import { motion } from "framer-motion";
import styles from "./store.module.css";

const { Paragraph, Title } = Typography;

const services = [
  "FOTO DNI I PASSAPORT",
  "IMPRESSIÓ DE FOTOGRAFIES AL MOMENT",
  "VAL REGAL SESSIONS",
  "DISSENY D’ÀLBUMS DE FOTOS",
  "MARCS DE FOTOS",
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.45, // ⬅️ temps entre elements (augmenta si ho vols més lent)
      delayChildren: 0.2, // ⬅️ delay inicial abans de començar
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.1, // ⬅️ duració de cada animació (més alt = més lent)
      ease: [0.22, 1, 0.36, 1], // ⬅️ ease super smooth (easeOutCubic vibe)
    },
  },
};

const ServicesList = () => (
  <motion.div variants={container} initial="hidden" animate="show">
    {services.map((service) => (
      <motion.div key={service} variants={item}>
        {service}
      </motion.div>
    ))}
  </motion.div>
);

const rightData: StoreBookProps = {
  title: "IMPRESSIÓ DE FOTOGRAFIES AL MOMENT",
  text: "Pots venir a l’estudi a imprimir les teves fotos, però si ho prefereixes, pots escriure'm un WhatsApp 623002792 i enviar-me les fotos, o omplir el formulari de reserves i tenir-les llestes per a quan et vagi bé venir a buscar-les.",
  buttonText: "ENVIA LES TEVES FOTOS",
};

const leftData: StoreBookProps = {
  title: "FOTO DNI",
  text: "Per venir a realitzar la foto de carnet a l’estudi heu de reservar hora a través del WhatsApp 623 00 27 92 o omplir el formulari de reserva.",
  buttonText: "DEMANA CITA",
};

export const StorePage = () => (
  <>
    <div className={styles.page}>
      <header>
        <CustomTitle label="LA" title="BOTIGA" />
      </header>

      {/* Llista serveis */}
      <Row justify="center">
        <Col xs={24} md={10} className={styles.services}>
          <ServicesList />
        </Col>
      </Row>

      {/* Reserves */}
      <div className={styles.bookings}>
        <Row align="stretch" gutter={[32, 32]}>
          <Col xs={24} md={10} className={styles.bookingColumn}>
            <StoreBook {...leftData} />
          </Col>

          <Col xs={24} md={14} className={styles.bookingColumn}>
            <StoreBook {...rightData} />
          </Col>
        </Row>
      </div>
    </div>

    {/* Vals regal */}
    <div className={styles.giftSection}>
      {/* Cercel decoratiu */}
      <div className={styles.decorCircle} />

      <Row gutter={[24, 24]} align="middle" className={styles.giftRow}>
        <Col xs={24} md={10}>
          <Title level={3} className={styles.giftTitle}>
            REGALA UNA SESSIÓ DE FOTOS
          </Title>

          <Paragraph className={styles.giftText}>
            Els vals regals estan pensats perquè puguis regalar una sessió de
            fotos d’embaràs, de recent nascut, familiar, de parella, de mascota
            ... A aquella persona especial que vol gaudir d’una experiència
            única amb un record fotogràfic.
          </Paragraph>
        </Col>

        <Col xs={24} md={7}>
          <div className={styles.giftStack}>
            <img
              src={getPublicPath("giftcard/2.jpg")}
              alt="Giftcard 1"
              className={styles.giftImageTall}
            />

            <img
              src={getPublicPath("giftcard/3.jpg")}
              alt="Giftcard 2"
              className={styles.giftImageShort}
            />
          </div>
        </Col>

        <Col xs={24} md={7}>
          <img
            src={getPublicPath("giftcard/1.jpg")}
            alt="Giftcard 1 gran"
            className={styles.giftImageHero}
          />
        </Col>
      </Row>
    </div>
  </>
);
