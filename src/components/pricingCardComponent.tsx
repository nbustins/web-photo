import { Button, Card, Typography } from "antd";
import { useNavigate } from "react-router";
import { AppRoutes, bookSessionPath } from "../model/routes.model";
import AdviceText from "./advicetext";
import styles from "./pricingCard.module.css";

const { Title, Text } = Typography;

const priceFormat = new Intl.NumberFormat('ca-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

interface PricingCardProps {
  title: string;
  features: string[];
  price: number;
  adviceText?: string | null;
  sessionTypeId?: number;
}

const PricingCard = ({ title, features, price, adviceText, sessionTypeId }: PricingCardProps) => {

  const navigate = useNavigate();

  return (<Card
    className={styles.card}
    styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
  >
    {/* Content above the price */}
    <div className={styles.body}>

      <Title level={3} className={styles.title}>
        SESSIÓ <br />
        {title.toUpperCase()}
      </Title>

      <hr className={styles.rule} />

      {features.map((item, index) => (
        <Text key={index} className={styles.feature}>
          {item}
        </Text>
      ))}

      {/* The asterisk is presentation, never stored with the text (API spec 007 QC10). */}
      {adviceText && (
        <div className={styles.advice}>
          <AdviceText>*{adviceText}</AdviceText>
        </div>
      )}
    </div>

    {/* Price */}
    <Title level={4} className={styles.price}>
      {priceFormat.format(price)}
    </Title>
    <div className={styles.actions}>
      <Button
        className={styles.bookButton}
        type="primary"
        onClick={() => navigate(sessionTypeId ? bookSessionPath(sessionTypeId) : AppRoutes.bookSession)}
      >
        Reserva
      </Button>
    </div>

  </Card>)
};
export default PricingCard;
