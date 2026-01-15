import { Button, Col, Row, Space } from "antd";
import { CustomTitle } from "../../components/customTitle";
import React from "react";
import { getPublicPath } from "../../utils/pathUtils";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

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

export const StorePage = () => (
  <>
    <section
      style={{
        backgroundImage: `url(${getPublicPath("/store/1.jpg")})`,
        backgroundSize: "100% auto", // NO deforma
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        height: 1000,
      }}
    >
      <Space
        direction="vertical"
        size={48} // controla exactament l’espai
        style={{
          width: "100%",
          height: "100%",
          paddingTop: 32, // opcional
          paddingBottom: 32, // opcional
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

    <div>
      <Row gutter={[32, 32]} align="stretch">

        {/* Esquerra */}
        <Col xs={24} md={10} style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              padding: "24px",
            }}
          >
            <Title level={3} style={{ marginTop: 0 }}>
              FOTO DNI
            </Title>

            <Paragraph style={{ fontSize: "1.1rem" }}>
             Per venir a realitzar la foto de carnet a l’estudi heu de reservar hora a través del WhatsApp 623 00 27 92.
            </Paragraph>

            <div style={{marginTop:"200", display: "flex", justifyContent: "center" }}>
              <Button type="primary" style={{ width: "100%", maxWidth: 420 }}>
                Continuar
              </Button>
            </div>
            </div>
        </Col>

        {/* Dreta */}
        <Col xs={24} md={14} style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              padding: "24px",
            }}
          >
            <Title level={3} style={{ marginTop: 0 }}>
              IMPRESSIÓ DE FOTOGRAFIES AL MOMENT
            </Title>

            <Paragraph style={{ fontSize: "1.1rem" }}>
              Pots venir a l’estudi a imprimir les teves fotos, però si ho prefereixes, pots enviar-me un correu a lauratfotografia@gmail.com o un WhatsApp 623002792 i enviar-me les fotos per tenir-les llestes per a quan et vagi bé venir a buscar-les.
            </Paragraph>

               <div style={{marginTop:"200", display: "flex", justifyContent: "center" }}>
              <Button
                type="primary"
                style={{
                  width: "100%",
                  maxWidth: 320,
                  height: 54,          // més alt
                  borderRadius: 999,  // super rodó (pill)
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                Pujar foto DNI
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </>
);
