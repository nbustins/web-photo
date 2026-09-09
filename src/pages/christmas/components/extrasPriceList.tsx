import styles from "./extrasPriceList.module.css";

const priceFormat = new Intl.NumberFormat("ca-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// ponytail: llistat estàtic. Passar-lo a l'API (com el catàleg de sessions) quan calgui
// editar-lo sense desplegar.
const extras: [string, number][] = [
  ["Paquet de 8 postals doble cara", 10],
  ["Paquet de 4 postals díptic", 8],
  ["Adorn PVC avet/estrella/cercle", 7],
  ["Adorn fusta doble foto", 12.5],
  ["Carpeta amb 5 fotos impreses 15x20", 12.5],
  ["Mini àlbum 15x15", 45],
  ["Àlbum 25x25", 65],
  ["Photoblock metracrilat", 25],
  ["Acordeó 10x15 2 unitats", 22],
];

export const ExtrasPriceList = () => (
  <div className={styles.block}>
    <div className={styles.heading}>Preus</div>

    <dl className={styles.list}>
      {extras.map(([name, price]) => (
        <div key={name} className={styles.row}>
          <dt>{name}</dt>
          <dd className={styles.price}>{priceFormat.format(price)}</dd>
        </div>
      ))}
    </dl>
  </div>
);
