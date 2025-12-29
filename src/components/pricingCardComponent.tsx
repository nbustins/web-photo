import { JSX } from "react";
import { Card, Typography } from "antd";
import { radii } from "../styles/tokens/radii";

const { Title, Text } = Typography;

interface PricingCardProps {
  title: string;
  features: (string | JSX.Element)[];
  price: string;
}

const PricingCard = ({ title, features, price } : PricingCardProps) => (
  <Card
    style={{
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
      boxShadow: 'none',
      borderRadius: radii.md,
    }}
  >
    {/* Content above the price */}
    <div style={{ flex: 1 }}> {/* This takes up all available space above the price */}

      <Title level={3} style={{ fontSize: '3rem', marginBottom: '8px', fontFamily: 'Italiana'}}>
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
      {price}
    </Title>
  </Card>
);
export default PricingCard;
