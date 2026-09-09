import { CustomTitle, FAQs, SessionPricingCards, ThreePhotoRow } from "@components";
import { getPublicPath } from "../../utils/pathUtils";
import { ChristmasIntroBlock } from "./components/christmasIntroBlock";
import { ExtrasPriceList } from "./components/extrasPriceList";
import blocks from "@components/blocks.module.css";
import styles from "./christmas.module.css";

/** Grup del catàleg (API spec 007). Les targetes de preus surten de l'API, com la resta. */
const CHRISTMAS_GROUP_ID = 5;

//TODO: fotos de familiar/ com a placeholder fins que hi hagi public/christmas/.
const photo = (name: string) => getPublicPath(`familiar/${name}`);

const extras = [
  {
    title: "POSTALS EXTRES",
    text: (
      <p>
        Les postals s'encarreguen per paquets de 8 i les postals format díptic per paquets de 4.
      </p>
    ),
  },
  {
    title: "ADORN ARBRE",
    text: (
      <p>
        Hi ha dos tipus d'adorn, el de PVC que pots escollir entre tres formes (avet, estrella,
        cercle) amb una foto de la sessió a escollir. I el de fusta, amb una sola forma circular
        i pots escollir dues imatges.
      </p>
    ),
  },
  {
    title: "CARPETA AMB 5 FOTOS IMPRESES",
    text: (
      <p>
        Carpeta nadalenca amb 5 fotos impreses de mida 20 x 15 per poder guardar o regalar als
        familiars o amics durant les festes de Nadal.
      </p>
    ),
  },
];

export const ChristmasPage = () => (
  <>
    <div className={blocks.pageBody}>
      <header>
        <CustomTitle label="SESSIÓ" title="NADAL 2026" />
      </header>

      <ThreePhotoRow
        photoPaths={[photo("2.jpg"), photo("3.jpg"), photo("4.jpg")]}
        rowClassName={blocks.sectionRow}
      />
    </div>

    <ChristmasIntroBlock image={photo("5.jpg")} imageAlt="Sessió de Nadal a l'estudi" />

    <div className={blocks.pageBody}>
      <SessionPricingCards sessionGroupId={CHRISTMAS_GROUP_ID} />
    </div>

    <FAQs
      heading={<>EXTRES NADAL</>}
      itemTitleClassName={styles.extraTitle}
      imageSrc={photo("6.jpg")}
      imageAlt="Decorat de Nadal"
      faqs={extras}
      imageWidth="75%"
    />

    <ExtrasPriceList />
  </>
);
