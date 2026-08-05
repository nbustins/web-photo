import { Col, Row } from "antd";
import { CustomTitle, ImageSlider, SessionPricingCards } from "@components";
import { getPublicPath } from "../../utils/pathUtils";
import { ThreePhotoRow } from "./components/threeFamiliarPhotos";
import blocks from "@components/blocks.module.css";
import styles from "./familiar.module.css";

const fromIdx = 4;
const toIdx = 12;
const rotPhotoPaths: string[] = Array.from({ length: (toIdx - fromIdx + 1) }, (_, i) => getPublicPath(`familiar/${fromIdx + i}.jpg`));

export const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.15,
      ease: "easeOut"
    }
  }
};

const sessionDescription = (
<p>
  Les sessions familiars van més enllà del resultat fotogràfic, també és una
experiència i un gran moment per gaudir amb família
</p>)

const sessionDescription2 = (
  <p>
    COMPLICITAT  TENDRESA  NATURALITAT  UNIÓ ESPONTANEÏTAT  FELICITAT
  </p>
)


export const FamiliarPage = () => (

    <>
        <div className={blocks.pageBody}>
            <header>
                <CustomTitle label="SESSIÓ" title="FAMILIAR" />  
            </header>

             <ThreePhotoRow/>

              {/* Text decriptiu */}
              <Row justify="center" className={blocks.sectionRow}> 
                <Col className={styles.lead}>
                  {sessionDescription}
                </Col>
              </Row>
              
              {/* Photo kids */}
              <Row justify="center" className={blocks.sectionRow}>
                <div className={styles.kidsFrame}>
                  <img
                    src={getPublicPath('familiar/4.jpg')}
                    alt="three kids photo"
                    className={styles.kidsImage}
                  />
                </div>
              </Row>
              
              {/* Frase 2 */}
              <div className={styles.quoteWrap}>
                <div className={styles.quote}>
                  {sessionDescription2}
                </div>
              </div>

              {/* Carrousel images */}
              <Row gutter={[24, 24]} justify="center" className={blocks.carouselRow}>
                <ImageSlider images={rotPhotoPaths}/>
              </Row>
              
               {/*  Price List */}
              <SessionPricingCards sessionGroupId={3} /> 
        </div>
    </>
);