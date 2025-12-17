import { Typography, Row, Col, Flex } from "antd";
import { FC } from "react";
import { PhotoItem, PricingCard, ImageSlider, AdviceText } from "../../components";
import { motion } from "framer-motion";
import FAQs from "../../components/FAQs";
import { getPublicPath } from "../../utils/pathUtils";
import { radii } from "../../styles/tokens/radii";

const { Title } = Typography;

const rowStyle = {
  padding: "3rem",
  width: '100%',
  display : "flex",
}

const photoPaths: string[] = Array.from(
  { length: 3 },
  (_, i) => getPublicPath(`pregnancy/${i + 1}.jpg`)
);

const rotPhotoPaths: string[] = Array.from(
  { length: 4 },
  (_, i) => getPublicPath(`pregnancy/rot_${i + 1}.jpg`)
);  

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

const faq1text = () => 
(
  <p>
    La millor etpapa per fer la sessió és entre la setmana 28 i 32
    d’embaràs.
  </p>
)


const faq2text = () => 
(
  <p>
  Sempre recomano reservar cap a la setmana 20 d’embaràs, que
  tinguem temps a organitzar i coincidir agenda. 

  Per reservar ho pots fer a travès de la web o enviant-me un
  WhatsApp al 623 00 27 92
  </p>
)


const faq3text = () => 
(
  <p>
   El tipus de sessió és personal, l’estudi està més preparat per a les sessions, ja que teniu vestidor per canviar-vos, la roba de l’estudi, materials i atrezzo que podem utilitzar, etc. i la sessió està més preparada i tenim més hores al dia per poder fer la sessió.
   Les sessions d’exterior són molt naturals i al ser a l’aire lliure tot el que no depengui de nosaltres no ho podem controlar, per això hem d’anar molt preparats. La ubicació la triem amb la vostra preferència de mar, muntanya, camp, gorg o qualsevol idea que us vingui al cap, tot és possible, però el més important és saber que aquesta es realitzen a la tarda el moment en què el sol cau, a l’hivern serà cap a les 17:00 h. i a l’estiu serà cap a les 19:00 h.
  </p>
)


const faq4text = () => 
(
  <p>
    El vestuari de l’estudi és una part on hi ha roba que podeu utilitzar i
    que està pensada per tenir una bona harmonia en cada tipus de
    sessió, sigui a l’estudi o a l’exterior, aquesta sempre està disponible i
    podeu utilitzar el que més us agradi, tot i que sempre recomano
    portar una muda de recanvi amb roba vostre que us sentiu còmodes.
  </p>
)

export const PregnantPage : FC = () => (

  <>
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
    
    {/* Foto gran mare embarassada */}
    <Row gutter={[24, 24]} justify="center">
      <Col xs={24}>
        <div
          style={{
            maxWidth: "100rem",
            margin: "0 auto",
            borderRadius: radii.md,
            overflow: "hidden",
          }}
        >
          <img
            src={getPublicPath("/pregnancy/gran.jpg")}
            alt="Imatge de la mare embarassada"
            style={{
              width: "100%",
              display: "block",
            }}
          />
        </div>
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
    
    <FAQs
      imageSrc={getPublicPath("/pregnancy/rot_4.jpg")}
      faqs={[
        { title: "QUINA SETMANA ÉS REALITZA LA SESSIÓ?", text: faq1text() },
        { title: "COM I QUAN HAIG DE RESERVAR LA SESSIÓ?", text: faq2text() },
        { title: "COM SÉ SI ÉS MIILLOR LA SESSIÓ A L'EXTERIOR O A L'ESTUDI?", text: faq3text() },
        { title: "QUE ÉS EL VESTUARI DE L’ESTUDI?", text: faq4text() }

      ]}/>
  </>

);


