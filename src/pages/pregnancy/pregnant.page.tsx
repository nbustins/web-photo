import { Typography, Row, Col, Flex } from "antd";
import { FC } from "react";
import { PhotoItem, PricingCard, ImageSlider, AdviceText } from "../../components";
import { motion } from "framer-motion";

const { Title } = Typography;

const rowStyle = {
  padding: "3rem",
  width: '100%',
  display : "flex"
}

const photoPaths: string[] = Array.from({ length: 3 }, (_, i) => `/pregnancy/${i + 1}.jpg`);
const rotPhotoPaths: string[] = Array.from({ length: 4 }, (_, i) => `/pregnancy/rot_${i + 1}.jpg`);

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // delay between children
    },
  },
};

const textWhyDoThisSession = (
      <p>
        Perquè l’embaràs és una etapa que no es repeteix mai igual. Pots pensar que la recordaràs sempre, però amb el temps, els detalls s’esvaeixen.
        <br/> Fer-te una sessió és regalar-te un espai per parar, respirar i connectar amb tot el que vius i sents. És un record per tu, però també per al teu bebè: un dia podràs mostrar-li les ganes amb què l’esperàveu i com ja l’estimàveu.
      </p>
)

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

  {/* 3 photos */}
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <Row gutter={[24, 24]} justify="center" style={rowStyle}>
      {photoPaths.map((path, index) => (
        <PhotoItem key={index} src={path} alt="test" />
      ))}
    </Row>
  </motion.div>

  {/* Text why to do this session */}
  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
    <Col xs={24} md={8} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{
        fontSize: "4rem",
        fontWeight: 700,
        textAlign: "center",
        lineHeight: 1.1,
        marginBottom: "1rem",
        transform: "rotate(-15deg)"
      }}>
        Per què recomano fer<br />la sessió d’embaràs?
      </span>
    </Col>
    <Col xs={24} md={16} style={{ fontSize: "2rem", textAlign: "justify" }}>
      {textWhyDoThisSession}
    </Col>
  </Row>

  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
  <Col xs={24} md={24} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <img
      src="/pregnancy/gran.jpg"
      alt="Imatge de la mare embarassada"
      style={{
        width: "100%",
        maxWidth : "100rem",
        marginBottom: "1rem",
        borderRadius: "1rem"
      }}
    />
  </Col>
</Row>


  {/* Big quote */}
  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
    <Col style={{ fontSize: "3rem", textAlign: "justify",fontWeight: 600, fontFamily:"Playfair Display" }}>
            “Una sessió perquè et sentis viva, única, delicada, natural, poderosa, lluminosa i estimada”
    </Col>
  </Row>
  

  {/* Carrousel images */}
  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
    <ImageSlider images={rotPhotoPaths}/>
  </Row>

  {/*  Price List */}
  <Row gutter={[24, 24]} justify="center" style={rowStyle}>
    <Flex wrap="wrap" gap="small" align="center" justify="space-evenly" style={{width: "100%"}}>
      <PricingCard
            title="Basica"
            features={[
              "90 minuts de sessió",
              "Guia per anar preparats a la sessió",
              "Vestuari inclòs",
              "Entrega de 15 fotos editades",
              <br/>,
              <br/>
              
            ]}
            price="210€"
          />
         <PricingCard
          title="Domicili"
          features={[
             "90 minuts de sessió",
              "Guia per anar preparats a la sessió",
              "Vestuari inclòs",
              "Entrega de 15 fotos editades",
              <br/>,
              <AdviceText>*A partir de 35 km des de l’estudi, pot haver-hi cost extra per desplaçament</AdviceText>,            
          ]}
          price="210€"
        />
        <PricingCard
          title="Completa"
          features={[
           "90 minuts de sessió",
           "Guia per anar preparats a la sessió",
           "Galeria completa",
           "5 fotos impresses de 18x13",
           "Taco de fusta amb doble foto",
           <br/>,
          ]}
          price="260€"
        />

    </Flex>
  </Row> 
</div>
);