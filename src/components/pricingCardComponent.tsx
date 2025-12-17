import React, { JSX } from "react";
import { Card, Typography } from "antd";
import { radii } from "../styles/tokens/radii";

const { Title, Text } = Typography;

interface PricingCardProps {
  title: string;
  features: (string | JSX.Element)[];
  price: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, features, price }) => (
  <Card
    style={{
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
      boxShadow: 'none',
      borderRadius: radii.md,
      minWidth : '35rem',
    }}
  >
    {/* Content above the price */}
    <div style={{ flex: 1 }}> {/* This takes up all available space above the price */}

      <Title level={3} style={{ fontSize: '4rem', marginBottom: '8px' }}>
        SESSIÓ <br />
        {title.toUpperCase()}
      </Title>
      <hr style={{ width: '60%', margin: '16px auto' }} />

      {features.map((item, index) => (
        <Text key={index} style={{fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>
          {item}
        </Text>
      ))}
    </div>

    {/* Price */}
    <Title
      level={4}
      style={{
        marginTop: '1.5rem',
        fontSize : '3rem'
      }}
    >
      {price}
    </Title>
  </Card>
);
export default PricingCard;
