import React from "react";
import { Row, Col, Typography } from "antd";
import { radii } from "../styles/tokens/radii";

const { Title, Text } = Typography;

interface FAQItem {
  title: string;
  text: React.ReactNode;
}

interface FAQsProps {
  imageSrc: string;
  imageAlt?: string;
  faqs: FAQItem[];
  imageWidth?: string;

}

const FAQs = ({ imageSrc, imageAlt = "FAQ image", faqs, imageWidth = "100%" }: FAQsProps) => (
  <div
    style={{
      background: "#FFF9E5", // cream yellow
      padding: "2rem",
      borderRadius: radii.md,
      width: "100%",
      boxSizing: "border-box",
    }}
  >
    <Row gutter={[32, 32]} align="top" justify="center">

      {/* Left column: Title and image */}
      <Col xs={24} md={8} 
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center", 
            flexGrow: 1,
          }}>
        <Title
          level={2}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "3rem",
            marginBottom: "2rem",
            color: "black",
          }}
        >
          PREGUNTES<br />FREQÜENTS
          <hr
            style={{
              border: "none",
              height: "2px",
              width: "60%",
              margin: "1rem auto",
              background: "black",
              borderRadius: radii.md,
            }}
          />
        </Title>
        <img
          src={imageSrc}
          alt={imageAlt}
          style={{
            width: imageWidth,
            borderRadius: radii.md,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "block",
          }}
        />
      </Col>
      
      {/* Right column: FAQ list */}
      <Col xs={24} md={16} style={{maxWidth: "900px"}}>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ marginBottom: "2rem" }}>
            <Title
              level={4}
              style={{
                fontSize: "1.5rem",
                marginBottom: "0.5rem",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 800,
              }}
            >
              {faq.title}
            </Title>
            <Text
              style={{
                fontSize: "1.2rem",
                color: "#333",
                textAlign: "justify",
                display: "block",
                hyphens: "auto",
              }}
        >
              {faq.text}
            </Text>
          </div>
        ))}
      </Col>
    </Row>
  </div>
);

export default FAQs;