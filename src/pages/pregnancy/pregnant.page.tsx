import { Row, Col } from "antd";
import { PricingCard, ImageSlider } from "../../components";
import FAQs from "../../components/FAQs";
import { getPublicPath } from "../../utils/pathUtils";
import { CustomTitle } from "../../components/customTitle";
import { WhyDoSession } from "../../components/whyDoSession";
import { ThreePhotoRow } from "../../components/threePhotoComponent";
import { pageBodyPadding } from "../../styles/tokens/radii";

const rowStyle = {
  padding: "3rem",
  width: "100%",
  display: "flex",
};

const photoPaths: string[] = Array.from({ length: 3 }, (_, i) =>
  getPublicPath(`pregnancy/${i + 1}.jpg`)
);

const rot_ini = 5;
const rot_end = 16;

const rotPhotoPaths: string[] = Array.from(
  { length: rot_end - rot_ini + 1 },
  (_, i) => getPublicPath(`pregnancy/${rot_ini + i}.jpg`)
);

const textWhyDoThisSession = (
  <p>
    Perquè l’embaràs és una etapa que no es repeteix mai igual. Pots pensar que
    la recordaràs sempre, però amb el temps, els detalls s’esvaeixen.
    <br /> Fer-te una sessió és regalar-te un espai per parar, respirar i
    connectar amb tot el que vius i sents. És un record per tu, però també per
    al teu bebè: un dia podràs mostrar-li les ganes amb què l’esperàveu i com ja
    l’estimàveu.
  </p>
);

const faq1text = () => (
  <p>
    La millor etapa per fer la sessió és entre la setmana 28 i 32 d’embaràs.
  </p>
);

const faq2text = () => (
  <p>
    Sempre recomano reservar cap a la setmana 20 d’embaràs, que tinguem temps d'
    organitzar i coincidir agenda. Per reservar ho pots fer a través de la web o
    enviant-me un WhatsApp al 623 00 27 92
  </p>
);

const faq3text = () => (
  <p>
    El tipus de sessió és personal, l’estudi està més preparat per a les
    sessions, ja que teniu vestidor per canviar-vos, la roba de l’estudi,
    materials i attrezzo que podem utilitzar, etc. i la sessió està més preparada
    i tenim més hores al dia per poder fer la sessió. Les sessions d’exterior
    són molt naturals i al ser a l’aire lliure tot el que no depengui de
    nosaltres no ho podem controlar, per això hem d’anar molt preparats. La
    ubicació la triem amb la vostra preferència de mar, muntanya, camp, gorg o
    qualsevol idea que us vingui al cap, tot és possible, però el més important
    és saber que aquesta es realitzen a la tarda el moment en què el sol cau, a
    l’hivern serà cap a les 17:00 h. i a l’estiu serà cap a les 19:00 h.
  </p>
);

const faq4text = () => (
  <p>
    El vestuari de l’estudi és una part on hi ha roba que podeu utilitzar i que
    està pensada per tenir una bona harmonia en cada tipus de sessió, sigui a
    l’estudi o a l’exterior, aquesta sempre està disponible i podeu utilitzar el
    que més us agradi, tot i que sempre recomano portar una muda de recanvi amb
    roba vostre que us sentiu còmodes.
  </p>
);

const faq5text = () => (
  <p>
    La sessió de maquillatge i perruqueria és dirigida per la Mireia,
    maquilladora professional, on ella us assessorarà i escoltarà les vostres
    preferències. Que la Mireia formi part de l'estudi és molt important pel
    resultat de les imatges, ja que ella ressaltarà les vostres faccions i us
    arreglarà els cabells perquè durant la sessió només hàgiu d'estar pendents
    de passar-ho bé i gaudir del moment.
  </p>
);

const faq6text = () => (
  <p>
    El vestuari de l’estudi és una part on hi ha roba que podeu utilitzar i que
    està pensada per tenir una bona harmonia en cada tipus de sessió, sigui a
    l’estudi o a l’exterior, aquesta sempre està disponible i podeu utilitzar el
    que més us agradi, tot i que sempre recomano portar una muda de recanvi amb
    roba vostre que us sentiu còmodes.
  </p>
);

export const PregnantPage = () => (
  <>
    <div style={{ padding: pageBodyPadding }}>

      <header>
        <CustomTitle label="SESSIÓ" title="EMBARÀS" />
      </header>

      {/* 3 photos */}
      
      <ThreePhotoRow
        photoPaths={[photoPaths[0], photoPaths[1], photoPaths[2]]}
        rowStyle={rowStyle}
      />

      {/* Text why to do this session */}
      <Row
        gutter={[0, 24]}
        justify="center"
        style={{
          marginLeft: -40,
          marginRight: -40,
        }}
      >
        <WhyDoSession textWhyDoThisSession={textWhyDoThisSession} />
      </Row>

      {/* Big quote */}
      <Row gutter={[24, 24]} justify="center" style={rowStyle}>
        <Col
          style={{
            fontSize: "clamp(1.2rem, 4vw, 2.5rem)",
            textAlign: "center",
            fontWeight: 600,
            fontFamily: "Italiana",
            letterSpacing: "0.1rem",
            maxWidth: "2000px",
          }}
        >
          “Una sessió perquè et sentis viva, única, delicada, natural, poderosa,
          lluminosa i estimada”
        </Col>
      </Row>

      {/* Carrousel images */}
      <Row gutter={[24, 24]} justify="center" style={{ margin: "0 0 3rem 0" }}>
        <ImageSlider images={rotPhotoPaths} />
      </Row>

      {/*  Price List */}
      <Row gutter={[24, 24]} justify="center">
       <Col xs ={24} md={8}>
       
          <PricingCard
            title="Bàsica"
            features={[
              "45 minuts de sessió",
              "Guia per anar preparats a la sessió",
              "Vestuari inclòs",
              "Sessió familiar i individual",
              "Galeria Online",
              "Entrega de 20 fotos editades (galeria completa +60€)",
              "5 Fotos impreses 18x13",
              <br />,
            ]}
            price="200€"
          />
       </Col>
        <Col xs ={24} md={8}>

          <PricingCard
            title="Exterior"
            features={[
              "45 minuts de sessió",
              "Guia per anar preparats a la sessió",
              "Vestuari inclòs",
              "Sessió familiar i individual",
              "Galeria online",
              "Entrega de 20 fotos editades (galeria completa +60€)",
              <br />,
              <br />,
            ]}
            price="215€"
          />
        </Col>

        <Col xs ={24} md={8}>
          <PricingCard
            title="Completa"
            features={[
              "45 minuts de sessió",
              "Guia per anar preparats a la sessió",
              "Vestuari inclòs",
              "Sessió familiar i individual",
              "Galeria Online",
              "Entrega de 20 fotos editades (galeria completa +60€)",
              "5 Fotos impreses 18x13",
              "Sessió de maquillatge i perruqueria",
            ]}
            price="260€"
          />
        </Col>
      </Row>
    </div>

    <FAQs
      imageSrc={getPublicPath("pregnancy/16.jpg")}
      faqs={[
        { title: "QUINA SETMANA ÉS REALITZA LA SESSIÓ?", text: faq1text() },
        { title: "COM I QUAN HAIG DE RESERVAR LA SESSIÓ?", text: faq2text() },
        {
          title: "COM SÉ SI ÉS MILLOR LA SESSIÓ A L'EXTERIOR O A L'ESTUDI?",
          text: faq3text(),
        },
        { title: "QUÈ ÉS EL VESTUARI DE L’ESTUDI?", text: faq4text() },
        {
          title: "DE QUÈ TRACTA LA SESSIÓ DE MAQUILLATGE I PERRUQEURIA?",
          text: faq5text(),
        },
        { title: "QUÈ ÉS EL VESTUARI DE L’ESTUDI?", text: faq6text() },
      ]}
    />
  </>
);
