import { Col, Row, Space } from "antd";
import { CustomTitle } from "../../components/customTitle";
import { getPublicPath } from "../../utils/pathUtils";
import { ThreePhotoRow } from "./components/threeFamiliarPhotos";
import { pageBodyPadding, radii } from "../../styles/tokens/radii";
import { ImageSlider, PricingCard } from "../../components";

const fromIdx = 4;
const toIdx = 12;
const rotPhotoPaths: string[] = Array.from({ length: (toIdx - fromIdx + 1) }, (_, i) => getPublicPath(`/familiar/${fromIdx + i}.jpg`));

const rowStyle = {
  padding: "30px",
  width: '100%',
  display : "flex"
}

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
        <div style={{padding : pageBodyPadding}}>
            <header>
                <CustomTitle label="SESSIÓ" title="FAMILIAR" />  
            </header>

             <ThreePhotoRow/>

              {/* Text decriptiu */}
              <Row justify="center" style={rowStyle}> 
                <Col
                  style={{
                    maxWidth: "1200px",
                    fontSize: "2rem",
                    textAlign: "center",
                    fontFamily: "Italiana",
                    padding: "0 1rem"
                  }}
                >
                  {sessionDescription}
                </Col>
              </Row>
              
              {/* Photo kids */}
              <Row justify="center" style={rowStyle}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "1500px",
                    height: "600px",
                    overflow: "hidden",
                    borderRadius: radii.md
                  }}
                >
                  <img
                    src={getPublicPath('familiar/4.jpg')}
                    alt="three kids photo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
              </Row>
              
              {/* Frase 2 */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    maxWidth: 800,
                    padding: "0 1rem",
                    fontSize: "2rem",
                    textAlign: "center",
                    fontFamily: "'Playfair Display'",
                    letterSpacing: "0.2rem",
                  }}
                >
                  {sessionDescription2}
                </div>
              </div>

              {/* Carrousel images */}
              <Row gutter={[24, 24]} justify="center" style={{ marginBottom: 24 }}>
                <ImageSlider images={rotPhotoPaths}/>
              </Row>
              
               {/*  Price List */}
              <Row gutter={[24, 24]} justify="center" >
                <Col xs={24} md={8}>
                    <PricingCard
                          title="Estudi"
                          features={[
                            "45 minuts de sessió",
                            "Guia per anar preparats a la sessió",
                            "Vestuari inclòs (un canvi de roba)",
                            "Galeria Online",
                            "Entrega de 20 fotos editades (galeria completa +60€)",
                            "5 fotos impreses 10 x 15"
                          ]}
                          price="160€"
                        />
                </Col>
                <Col xs={24} md={8}>
                    <PricingCard
                      title="Exterior"
                      features={[
                        "45 minuts de sessió",
                        "Guia per anar preparats a la sessió",
                        "Vestuari inclòs (un canvi de roba)",
                        "Galeria Online",
                        "Entrega de 20 fotos editades (galeria completa +60€)",
                        <br/>,
                      ]}
                      price="170€"
                    />
                </Col>
              </Row> 
        </div>
    </>
);