import React from "react";
import { Row, Col, Typography } from "antd";
import styles from "./FAQs.module.css";

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
  <div className={styles.block}>
    <Row gutter={[32, 32]} align="top" justify="center">

      {/* Left column: Title and image */}
      <Col xs={24} md={8} className={styles.left}>
        <Title level={2} className={styles.heading}>
          PREGUNTES<br />FREQÜENTS
          <hr className={styles.rule} />
        </Title>
        <img src={imageSrc} alt={imageAlt} className={styles.image} style={{ width: imageWidth }} />
      </Col>

      {/* Right column: FAQ list */}
      <Col xs={24} md={16} className={styles.right}>
        {faqs.map((faq, idx) => (
          <div key={idx} className={styles.item}>
            <Title level={4} className={styles.itemTitle}>
              {faq.title}
            </Title>
            <Text className={styles.itemText}>
              {faq.text}
            </Text>
          </div>
        ))}
      </Col>
    </Row>
  </div>
);

export default FAQs;
