import { Col, Row } from "antd";
import { CustomTitle } from "../../components/customTitle";
import { getPublicPath } from "../../utils/pathUtils";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { StoreBook, StoreBookProps } from "./components/storeBook";
import { pageBodyPadding, radii } from "../../styles/tokens/radii";
import { motion } from "framer-motion";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5rem", // ⬅️ separació entre seccions
        padding: pageBodyPadding,
      }}
    >
      <header>
        <CustomTitle label="LA" title="BOTIGA" />
      </header>

      {/* Llista serveis */}
      <Row justify="center">
        <Col
          xs={24}
          md={10}
          style={{
            maxWidth: "1500px",
            fontSize: "1.5rem",
            textAlign: "center",
            fontFamily: "Italiana",
            padding: "0 1rem",
          }}
        >
          <ServicesList />
        </Col>
      </Row>

      {/* Reserves */}
      <div style={{ maxWidth: "1800px", margin: "0 auto", padding: "0 1rem" }}>
        <Row align="stretch" gutter={[32, 32]}>
          <Col
            xs={24}
            md={10}
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <StoreBook {...leftData} />
          </Col>

          <Col
            xs={24}
            md={14}
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <StoreBook {...rightData} />
          </Col>
        </Row>
      </div>
    </div>

    {/* Vals regal */}
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        background: "linear-gradient(180deg, #fffdf7 0%, #fbf6ea 100%)",
        position: "relative",
      }}
    >
      {/* Cercel decoratiu */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.04)",
          filter: "blur(2px)",
        }}
      />

      <Row gutter={[24, 24]} align="middle" style={{ padding: "40px" }}>
        <Col xs={24} md={10}>
          <Title
            level={3}
            style={{
              marginTop: 0,
              fontFamily: "Italiana",
              fontSize: "3rem",
              maxWidth: "650px",
              margin: "0 auto",
            }}
          >
            REGALA UNA SESSIÓ DE FOTOS
          </Title>

          <Paragraph
            style={{
              fontSize: "1.1rem",
              textAlign: "justify",
              maxWidth: "650px",
              margin: "0 auto",
            }}
          >
            Els vals regals estan pensats perquè puguis regalar una sessió de
            fotos d’embaràs, de recent nascut, familiar, de parella, de mascota
            ... A aquella persona especial que vol gaudir d’una experiència
            única amb un record fotogràfic.
          </Paragraph>
        </Col>

        <Col xs={24} md={7}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <img
              src={getPublicPath("giftcard/2.jpg")}
              alt="Giftcard 1"
              style={{
                width: "100%",
                height: 500,
                objectFit: "cover",
                borderRadius: radii.md,
              }}
            />

            <img
              src={getPublicPath("giftcard/3.jpg")}
              alt="Giftcard 2"
              style={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                borderRadius: radii.md,
              }}
            />
          </div>
        </Col>

        <Col xs={24} md={7}>
          <img
            src={getPublicPath("giftcard/1.jpg")}
            alt="Giftcard 1 gran"
            style={{
              width: "100%",
              height: 700,
              objectFit: "cover",
              borderRadius: radii.md,
              boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
            }}
          />
        </Col>
      </Row>
    </div>
  </>
);
