import { CustomTitle, FAQs, SessionPricingCards, ThreePhotoRow } from "@components";
import { ChristmasIntroBlock } from "./components/christmasIntroBlock";
import { ExtrasPriceList } from "./components/extrasPriceList";
import blocks from "@components/blocks.module.css";

/** Grup del catàleg (API spec 007). Les targetes de preus surten de l'API, com la resta. */
const CHRISTMAS_GROUP_ID = 5;

export const ChristmasPage = () => (
  <>
    <div className={blocks.pageBody}>
      <header>
        <CustomTitle label="SESSIÓ" title="NADAL 2026" />
      </header>

      <ThreePhotoRow
        photoPaths={["https://res.cloudinary.com/djxytedne/image/upload/v1789333582/nil_noa-22_rwubtc.jpg"
          , "https://res.cloudinary.com/djxytedne/image/upload/v1789333582/nil_noa1_o5jzvd.jpg"
          , "https://res.cloudinary.com/djxytedne/image/upload/v1789333582/nil_noa-43_eyzih0.jpg"]}
        rowClassName={blocks.sectionRow}
      />
    </div>

    <ChristmasIntroBlock image={"https://res.cloudinary.com/djxytedne/image/upload/v1789333582/nil_noa-10_sztdlu.jpg"} imageAlt="Sessió de Nadal a l'estudi" />

    <div className={blocks.pageBody}>
      <SessionPricingCards sessionGroupId={CHRISTMAS_GROUP_ID} />
    </div>

    {/* Els extres no es descriuen un per un: la foto d'ambient a l'esquerra i la llista de preus
        a la dreta, dins d'un sol bloc. */}
    <FAQs
      heading={<>EXTRES NADAL</>}
      imageSrc={"https://res.cloudinary.com/djxytedne/image/upload/v1789333582/nil_noa-50_wlk2vp.jpg"}
      imageAlt="Decorat de Nadal"
      imageWidth="75%"
    >
      <ExtrasPriceList />
    </FAQs>
  </>
);
