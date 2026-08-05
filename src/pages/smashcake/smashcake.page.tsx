import { Col, Row } from "antd";
import { CustomTitle, ImageSlider, SessionPricingCards, ThreePhotoRow, FAQs } from "@components";
import { getPublicPath } from "../../utils/pathUtils";
import { motion } from "framer-motion";
import blocks from "@components/blocks.module.css";
import styles from "./smashcake.module.css";

const fromIdx = 5;
const toIdx = 12;
const rotPhotoPaths: string[] = Array.from({ length: (toIdx - fromIdx + 1) }, (_, i) => getPublicPath(`smashcake/${fromIdx + i}.jpg`));

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
        Una sessió que et recordarà la velocitat amb què passa el
temps. Pensada per celebrar l'aniversari dels més petits de
casa.
    </p>
)

const sessionDescription2 = (
    <p>
        Una sessió per riure, compartir, gaudir del pastís i
veure lo ràpid que creixen
    </p>
)

const faq1text = () => (
    <p>
        Aquesta sessió recomano fer-la un mes abans del dia de l'aniversari,
així tenim un mes de marge per editar les fotos i, si volguéssiu algun
material per regalar per l'aniversari, aniríem tranquils amb el temps
d'entrega.
    </p>
);


const faq2text = () => (
    <p>
Aquesta sessió és recomanable reservar-la amb mínim de vint dies
d'antelació (sempre com més aviat millor, ja que puc tenir l'agenda
plena), així podem triar el pastís al vostre gust i que la pastissera
tingui temps de fer-lo.
    </p>
);

const faq3text = () => (
    <p>
  La sessió està formada de dues parts, la primera on realitzarem fotos familiars i la segona, on començarem amb el pastís.
  </p>
);

export const SmashCakePage = () => (
   <>
    <div className={blocks.pageBody}>

      <header>
          <CustomTitle label="SESSIÓ" title="SMASH CAKE" />  
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
            <div className={styles.heroWrap}>
              <img
              src={getPublicPath("smashcake/1.jpg")}
                alt="Imatge de la mare embarassada"
                className={blocks.heroImageRounded}
              />
            </div>
          </Col>
        </Row>
        </motion.div>


      {/* Text decriptiu */}
      <Row justify="center">
        <Col className={blocks.leadWide}>
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
          photoPaths={[getPublicPath(`smashcake/2.jpg`), getPublicPath(`smashcake/3.jpg`), getPublicPath(`smashcake/4.jpg`)]}
          rowClassName={blocks.sectionRow}
        />
      </motion.div>
      

      {/* Descripció sessió */}
      <Row gutter={[24, 24]} justify="center" className={blocks.sectionRow}>
        <Col className={blocks.leadNarrow}>
          {sessionDescription2}
        </Col>
      </Row>
        
      {/* Carrousel images */}
      <Row gutter={[24, 24]} justify="center" className={blocks.carouselRow}>
        <ImageSlider images={rotPhotoPaths}/>
      </Row>

      {/*  Price List */}
      <SessionPricingCards sessionGroupId={4} /> 
      </section>
    </div>
    
    <FAQs
      imageSrc={getPublicPath("smashcake/12.jpg")}
      faqs={[
        { title: "QUAN PODEM REALITZAR LA SESSIÓ?", text: faq1text() },
        { title: "COM I QUAN HAIG DE RESERVAR LA SESSIÓ?", text: faq2text() },
        { title: "COM SERÀ LA SESSIÓ?", text: faq3text() },
    ]}
    imageWidth="70%"/>
  </>
)
