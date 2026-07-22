import { Button, Card, Typography } from "antd";
import { radii } from "../styles/tokens/radii";
import { useNavigate } from "react-router";
import { AppRoutes, bookSessionPath } from "../model/routes.model";
import AdviceText from "./advicetext";

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
    // Full height + column layout so cards in a row line up their price and button regardless of
    // how many features each has. This used to be faked with <br/> padding inside the feature list.
    style={{
      height: '100%',
      textAlign: 'center',
      boxShadow: 'none',
      borderRadius: radii.md,
    }}
    styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
  >
    {/* Content above the price */}
    <div style={{ flex: 1 }}>

      <Title level={3} style={{ fontSize: "clamp(1.6rem, 3vw, 3rem)", marginBottom: '8px', fontFamily: 'Italiana'}}>
        SESSIÓ <br />
        {title.toUpperCase()}
      </Title>

      <hr
        style={{
          width: '40%',
          margin: '32px auto',
          border: 'none',
          height: '1.1px',
          borderRadius: '2px',
          backgroundColor: '#231f20',
        }}
      />

      {features.map((item, index) => (
        <Text key={index} style={{fontSize: '1rem', display: 'block', marginBottom: '8px' }}>
          {item}
        </Text>
      ))}

      {/* The asterisk is presentation, never stored with the text (API spec 007 QC10). */}
      {adviceText && (
        <div style={{ marginTop: '8px' }}>
          <AdviceText>*{adviceText}</AdviceText>
        </div>
      )}
    </div>

    {/* Price */}
    <Title
      level={4}
      style={{
        marginTop: '1.5rem',
        fontSize : '2rem',
        fontWeight: 400,
      }}
    >
      {priceFormat.format(price)}
    </Title>
    <div style={{ width: "100%", marginTop:"25px" }}>
      <Button
        style={{ width: 150 }}
          type="primary"
          onClick={() => navigate(sessionTypeId ? bookSessionPath(sessionTypeId) : AppRoutes.bookSession)}
        >
        Reserva
      </Button>
    </div>

  </Card>)
};
export default PricingCard;
