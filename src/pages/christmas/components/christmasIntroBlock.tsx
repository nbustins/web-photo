import blocks from "@components/blocks.module.css";
import styles from "./christmasIntroBlock.module.css";

/**
 * Banda fosca de presentació: un sol bloc de text i, a sota, una foto a tota amplada.
 * Reaprofita les classes de fons i d'imatge de whyDoSession; no reaprofita el component
 * perquè aquell parteix el text en dues columnes amb titular i aquí és text corregut.
 */
export const ChristmasIntroBlock = ({ image, imageAlt }: { image: string; imageAlt: string }) => (
  <div className={blocks.whySection}>
    <div className={styles.intro}>
      <p>
        Aquest Nadal, obre la porta a un món ple de màgia.
        Aquest any us convido a entrar en una habitació que sembla sortir d'un conte.
        Un espai inspirat en la màgia de la infància, en els Nadals d'abans i en aquells
        mons imaginaris que comencen just darrere d'una porta.
      </p>
      <p>
        Vine a l'estudi a gaudir d'una estona familiar totalment nadalenca.
      </p>
    </div>

    <div className={blocks.whyImageWrap}>
      <img src={image} alt={imageAlt} className={blocks.whyImage} />
    </div>
  </div>
);
