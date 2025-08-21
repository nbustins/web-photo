import { Typography, Row, Col, Flex } from "antd";
import { FC } from "react";
import { motion } from "framer-motion";
import { PhotoItem, AdviceText,PricingCard,ImageSlider  } from "../../components";
import FAQs from "../../components/FAQs";

const { Title } = Typography;

const photoPaths: string[] = Array.from({ length: 10 }, (_, i) => `/newborn/${i + 1}.jpg`);
const rotPhotoPaths: string[] = Array.from({ length: 4 }, (_, i) => `/newborn/rot_${i + 1}.jpg`);

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

const sessionDescription = (
  <p>
    Aquestes sessions tracten del contacte amb el teu nadó, dels
    seus primers dies, els seus primers gestos, les seves primeres
    ganyotes, les seves primeres mirades i la seva pell i la teva.
  </p>
);

const sessionAdvice = (
  <p>
    Per aquest tipus de sessió m'agrada poder-me adaptar a vosaltres i és per això que, tot i la
    meva recomanació de fer la sessió entre el dia 8 i 15 de vida del bebè no vull que això es
    converteixi en una condició, ja que tots els parts i els bebès són únics i diferents i ho deixo a
    les vostres mans. També us ofereixo el servei de poder fer la sessió a casa vostra.
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

export const NewBornPage : FC = () => (
  <>
    <div style={{ padding: "40px" }}>
      <header>
        <Title
          level={2}
          style={{
            textAlign: "center",
            fontSize: "4rem",
            lineHeight: "1.1",
            marginBottom: "40px",
          }}
        >
          SESSIÓ <br /> RECENT NASCUT
        </Title>
      </header>

      <section>

        {/* Wide photo at the top */}
        <img
        src="/newborn/gran_new_born.jpg"
        alt="Newborn session cover"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          borderRadius: "1rem",
          display: "block",
          margin: "0 auto 2rem auto" // centers the image and adds bottom margin
          }}
        />

        {/* Text decriptiu */}
        <Row gutter={[24, 24]} justify="center" style={rowStyle}>
          <Col style={{ fontSize: "1.5rem", textAlign: "justify" }}>
            {sessionDescription}
          </Col>
        </Row>
        
        {/* 3 imatges amb entrada moviment */}
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
        
        {/* Text recomanacio */}
        <Row gutter={[24, 24]} justify="center" style={rowStyle}>
            <Col style={{ fontSize: "1.5rem", textAlign: "justify" }}>
              {sessionAdvice}
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
                  "Taco de fusta amb double foto",
                  <br/>
                ]}
                price="260€"
              />
          </Flex>
        </Row> 

      </section>
    </div>
    
    <FAQs
      imageSrc="/newborn/rot_3.jpg"
      faqs={[
        { title: "QUAN PODEM REALITZAR LA SESSIÓ?", text: faq1text() },
        { title: "COM I QUAN HAIG DE RESERVAR LA SESSIÓ?", text: faq2text() },
        { title: "COM SERÀ LA SESSIÓ?", text: faq3text() }
    ]}/>
  </>
);