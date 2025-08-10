import { Typography, Row, Col, Flex } from "antd";
import { FC } from "react";
import PhotoItem from "./components/photoComponent";
import PricingCard from "./components/pricingCardComponent";
import ImageSlider from "./components/carrousel";
import { motion } from "framer-motion";

const { Title } = Typography;

const photoPaths: string[] = Array.from({ length: 10 }, (_, i) => `/pregnancy/${i + 1}.jpg`);
const rowStyle = {
  padding: "30px",
  width: '100%',
  display : "flex"
}

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // delay between children
    },
  },
};

export const PregnantPage : FC = () => (

  <div style={{ padding: "40px" }}>
  <Title
    level={2}
    style={{
      textAlign: "center",
      fontSize: "4rem",
      lineHeight: "1.1",
      marginBottom: "40px",
    }}
  >
    SESSIÓ <br /> EMBARÀS
  </Title>

  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <Row gutter={[24, 24]} justify="center" style={rowStyle}>
      {photoPaths.slice(0, 3).map((path, index) => (
        <PhotoItem key={index} src={path} alt="test" />
      ))}
    </Row>
  </motion.div>

  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
    <Col style={{ fontSize: "1.5rem", textAlign: "justify" }}>
      <p>Hi ha tres tipus de sessions d'embaràs diferents:</p>
      <ul style={{ listStyleType: "disc", marginLeft: "20px" }}>
        <li><strong>La sessió completa</strong> (a l'estudi)</li>
        <li><strong>La sessió bàsica</strong> (també a l'estudi)</li>
        <li><strong>La sessió a l'exterior</strong></li>
      </ul>
      <p>
        El més important en tots tres casos és saber que les sessions es realitzen entre la setmana 28 i 32 d'embaràs.
      </p>
    </Col>
</Row>


  {/* Carrousel images */}
  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
    <ImageSlider images={photoPaths.slice(3)}/>
  </Row>

  {/*  Price List */}

  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
    <Flex wrap="wrap" gap="small" align="center" justify="space-evenly" style={{width: "100%"}}>
      <PricingCard
            title="Completa"
            features={[
              "1 hora de sessió",
              "Guia per anar preparats a la sessió",
              "Vestuari inclòs",
              "Maquillatge i pentinat",
              "Totes les fotos incloses",
              "5 fotos impreses de 18x13",
              "Taco de fusta amb doble foto",
            ]}
            price="290€"
          />
         <PricingCard
          title="Bàsica"
          features={[
            "1 hora de sessió",
            "Guia per anar preparats a la sessió",
            "Vestuari inclòs",
            <>
              Entrega de 20 fotos editades <br />
              <strong>(galeria completa +50€)</strong>
            </>,
            "5 fotos impreses de 10x15",
            <br/>
            
          ]}
          price="200€"
        />
        <PricingCard
          title="Exterior"
          features={[
            "1 hora de sessió",
            "Guia per anar preparats a la sessió",
            "Vestuari inclòs",
            <>
              Entrega de 20 fotos editades <br />
              <strong>(galeria completa +50€)</strong>
            </>,
            "5 fotos impreses de 10x15",
            <br/>

          ]}
          price="215€"
        />

    </Flex>
      {/* <Col xs={24} sm={12} md={8} style={{ height: '100%' }}      >
        <PricingCard
          title="Completa"
          features={[
            "1 hora de sessió",
            "Guia per anar preparats a la sessió",
            "Vestuari inclòs",
            "Maquillatge i pentinat",
            "Totes les fotos incloses",
            "5 fotos impreses de 18x13",
            "Taco de fusta amb doble foto",
          ]}
          price="290€"
        />
      </Col>

      <Col xs={24} sm={12} md={8} style={{ height: '100%' }} >
        <PricingCard
          title="Bàsica"
          features={[
            "1 hora de sessió",
            "Guia per anar preparats a la sessió",
            "Vestuari inclòs",
            <>
              Entrega de 20 fotos editades <br />
              <strong>(galeria completa +50€)</strong>
            </>,
            "5 fotos impreses de 10x15",
            <br/>
            
          ]}
          price="200€"
        />
      </Col>

      <Col xs={24} sm={12} md={8} style={{ height: '100%' }} >
        <PricingCard
          title="Exterior"
          features={[
            "1 hora de sessió",
            "Guia per anar preparats a la sessió",
            "Vestuari inclòs",
            <>
              Entrega de 20 fotos editades <br />
              <strong>(galeria completa +50€)</strong>
            </>,
            "5 fotos impreses de 10x15",
            <br/>

          ]}
          price="215€"
        />
      </Col> */}
    </Row>


   
</div>
);