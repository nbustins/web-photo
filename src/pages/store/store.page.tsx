import { Button, Col, Row, Space } from "antd";
import { CustomTitle } from "../../components/customTitle";
import React from "react";
import { getPublicPath } from "../../utils/pathUtils";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { StoreBook, StoreBookProps } from "./components/storeBook";
import { title } from "process";
import { text } from "stream/consumers";

const services = [
  "FOTO DNI I PASSAPORT",
  "IMPRESSIÓ DE FOTOGRAFIES AL MOMENT",
  "VAL REGAL SESSIONS",
  "DISSENY D’ÀLBUMS DE FOTOS",
  "MARCS DE FOTOS",
];

const ServicesList = () => (
  <div>
    {services.map((service, i) => (
      <React.Fragment key={service}>
        {service}
        {i < services.length - 1 && <br />}
      </React.Fragment>
    ))}
  </div>
);

const rightData : StoreBookProps = {
  title: 'IMPRESSIÓ DE FOTOGRAFIES AL MOMENT',
  text:'Pots venir a l’estudi a imprimir les teves fotos, però si ho prefereixes, pots enviar-me un correu a lauratfotografia@gmail.com o un WhatsApp 623002792 i enviar-me les fotos per tenir-les llestes per a quan et vagi bé venir a buscar-les.',
  buttonText: 'ENVIA LES TEVES FOTOS'
}
          
const leftData : StoreBookProps = {
  title: 'FOTO DNI',
  text : 'Per venir a realitzar la foto de carnet a l’estudi heu de reservar hora a través del WhatsApp 623 00 27 92.',
  buttonText: 'DEMANA CITA'
}


export const StorePage = () => (
  <>
    <section
      style={{
        //backgroundImage: `url(${getPublicPath("/store/1.jpg")})`,
        backgroundSize: "100% auto", // NO deforma
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        //height: 1000,
      }}
    >
      <Space
        direction="vertical"
        size={18} // controla exactament l’espai
        style={{
          width: "100%",
          height: "100%",
          //paddingTop: 32, // opcional
          //paddingBottom: 32, // opcional
        }}
      >
        <header>
          <CustomTitle label="LA" title="BOTIGA" />
        </header>

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
            {ServicesList()}
          </Col>
        </Row>
      </Space>
    </section>

    <div style={{padding: "40px"}}>
      <Row  align="stretch">

        {/* Esquerra */}
        <Col xs={24} md={10} style={{ display: "flex" }}>
          <StoreBook {... leftData} />
        </Col>

        {/* Dreta */}
        <Col xs={24} md={14} style={{ display: "flex"}}>
          <StoreBook {... rightData} />
        </Col>
      </Row>
    </div>
<div style={{ width: "100%", overflowX: "hidden" }}>

<Row gutter={[24, 24]} align="middle"style={{padding : "40px"}}>
  <Col xs={24} md={10}>
    <Title level={3} style={{ marginTop: 0, fontFamily: "Italiana", fontSize: '3rem' }}>
      REGALA UNA SESSIÓ DE FOTOS
    </Title>

    <Paragraph style={{ fontSize: "1.1rem", textAlign: "justify" }}>
      Els vals regals estan pensats perquè puguis regalar una sessió de fotos
      d’embaràs, de recent nascut, familiar, de parella, de mascota ... A aquella
      persona especial que vol gaudir d’una experiència única amb un record
      fotogràfic.
    </Paragraph>
  </Col>

  {/* ✅ Columna del mig: 2 imatges (1 i 2) */}
  <Col xs={24} md={7}>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <img
        src={getPublicPath("giftcard/2.jpg")}
        alt="Giftcard 1"
        style={{
          width: "100%",
          height: 500,
          objectFit: "cover",
          borderRadius: 18,
        }}
      />

      <img
        src={getPublicPath("giftcard/3.jpg")}
        alt="Giftcard 2"
        style={{
          width: "100%",
          height: 400,
          objectFit: "cover",
          borderRadius: 18,
        }}
      />
    </div>
  </Col>

  {/* ✅ Última columna: la 1 */}
  <Col xs={24} md={7}>
    <img
      src={getPublicPath("giftcard/1.jpg")}
      alt="Giftcard 1 gran"
      style={{
        width: "100%",
        height: 700,
        objectFit: "cover",
        borderRadius: 18,
        boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
      }}
    />
  </Col>
</Row>
</div>
  </>
);
