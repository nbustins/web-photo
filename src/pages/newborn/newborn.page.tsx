import { Row, Col } from "antd";
import { motion } from "framer-motion";
import {  AdviceText,PricingCard,ImageSlider  } from "../../components";
import FAQs from "../../components/FAQs";
import { getPublicPath } from "../../utils/pathUtils";
import { CustomTitle } from "../../components/customTitle";
import { ThreePhotoRow } from "../../components/threePhotoComponent";

const fromIdx = 4;
const toIdx = 13;
const rotPhotoPaths: string[] = Array.from({ length: (toIdx - fromIdx + 1) }, (_, i) => getPublicPath(`/newborn/${fromIdx + i}.jpg`));

const rowStyle = {
  padding: "30px",
  width: '100%',
  display : "flex"
}

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

const sessionDescription = (
  <p>
    Aquestes sessions tracten del contacte amb el teu nadó, dels
    seus primers dies, els seus primers gestos, les seves primeres
    ganyotes, les seves primeres mirades i la seva pell i la teva.
  </p>
);

const sessionDescription2 = (
  <p>
Una sessió tranquil·la, dedicada, natural, amb molt
d’amor i adaptada a cada família
  </p>
);

const faq1text = () => (
  <p>
    La sessió sempre recomano fer-la entre els primers 7 i 15 dies de
vida del teu nadó, ja que dormen més. Així i tot, cada nadó i cada
part és diferent i si passen aquests 15 dies es pot realitzar igualment
la sessió. (això sí, no puc assegurar que puguem fer tots els decorats
o les poses)
  </p>
)

const faq2text = () => (
  <p>
    En aquesta sessió, es fa una prereserva que sempre és recomanable
fer-la cap a la setmana 32 d’embaràs, on jo m’apuntaré la data en
què sortiu de comptes i a partir d’aquí només quedarà esperar que
m’envieu un WhatsApp un cop hàgiu donat a llum per concretar el
dia i hora exacta.
  </p>
)

const faq3text = () => (
  <p>
La sessió està dividida en 3 parts diferents, la primera on adormirem el bebè i el col·locarem al puf per fer-li fotos amb posats senzills on se senti còmode i estigui tranquil. La segona part farem fotos life style familiars, amb pares i germans (si és el cas) i l’última part, seran fotos de detall com peuets, mans, pestanyes, etc.
  </p>
)

const faq4text = () => (
  <p>
La sessió de maquillatge i perruqueria és dirigida per la Mireia, maquilladora professional, on ella us assessorarà i escoltarà les vostres preferències.

Que la Mireia formi part de l'estudi és molt important pel resultat de les imatges, ja que ella ressaltarà les vostres faccions i us arreglarà els cabells perquè durant la sessió només hàgiu d'estar pendents de passar-ho bé i gaudir del moment.  </p>
)

export const NewBornPage = () => (
  <>
    <div style={{ padding: "0px" }}>

      <header>
          <CustomTitle label="SESSIÓ" title="RECENT NASCUT" />  
      </header>

      <section>

          {/* Wide photo at the top */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          <Row justify="center">
          <Col xs={24}>
            <div
              style={{
                width: "100%",
                height: "min(70vh, 750px)",
                overflow: "hidden",
                marginTop: "30px",
              }}
            >
              <img
              src={getPublicPath("/newborn/gran_new_born.jpg")}
                alt="Imatge de la mare embarassada"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  
                }}
              />
            </div>
          </Col>
        </Row>
        </motion.div>


      {/* Text decriptiu */}
      <Row justify="center">
        <Col
          style={{
            maxWidth: "1500px",
            fontSize: "2rem",
            textAlign: "center",
            fontFamily: "Italiana",
            padding: "0 1rem"
          }}
        >
          {sessionDescription}
        </Col>
      </Row>

        
      {/* 3 imatges amb entrada moviment */} 
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      >
        <ThreePhotoRow
          photoPaths={[getPublicPath(`/newborn/2.jpg`), getPublicPath(`/newborn/3.jpg`), getPublicPath(`/newborn/4.jpg`)]}
          rowStyle={rowStyle}
        />
      </motion.div>
      

      {/* Descripció sessió */}
      <Row gutter={[24, 24]} justify="center" style={rowStyle}>
        <Col
          style={{
              maxWidth: "950px",
              fontSize: "2.5rem",
              textAlign: "center",
              fontFamily: "Italiana",
            }}>
          {sessionDescription2}
        </Col>
      </Row>
        
      {/* Carrousel images */}
      <Row gutter={[24, 24]} justify="center" style={rowStyle}>
        <ImageSlider images={rotPhotoPaths}/>
      </Row>

      {/*  Price List */}
      <Row gutter={[24, 24]} justify="center" style={rowStyle}>
        <Col xs={24} md={8}>
            <PricingCard
                  title="Bàsica"
                  features={[
                    "90 minuts de sessió",
                    "Guia per anar preparats a la sessió",
                    "Vestuari inclòs",
                    "Entrega de 15 fotos editades",
                    <br/>,
                    <br/>,
                  ]}
                  price="210€"
                />
        </Col>
        <Col xs={24} md={8}>
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
        </Col>
        <Col xs={24} md={8}>
          <PricingCard
            title="Completa"
            features={[
              "90 minuts de sessió",
              "Guia per anar preparats a la sessió",
              "Galeria completa",
              "5 fotos impresses de 18x13",
              "Taco de fusta amb double foto",
              <br/>
            ]}
            price="260€"
          />
        </Col>
      </Row> 
      </section>
    </div>
    
    <FAQs
      imageSrc={getPublicPath("/newborn/14.jpg")}
      faqs={[
        { title: "QUAN PODEM REALITZAR LA SESSIÓ?", text: faq1text() },
        { title: "COM I QUAN HAIG DE RESERVAR LA SESSIÓ?", text: faq2text() },
        { title: "COM SERÀ LA SESSIÓ?", text: faq3text() },
        { title: "DE QUE TRACTA LA SESSIÓ DE MAQUILLATGE I PERRUQUERIA?", text: faq4text() }

    ]}
    imageWidth="75%"/>
  </>
);