import { Col, Row } from "antd";
import { ReactNode } from "react";
import { getPublicPath } from "../utils/pathUtils";

interface PregnancyWhySectionProps {
  textWhyDoThisSession: ReactNode;
}

export function WhyDoSession({
  textWhyDoThisSession,
}: PregnancyWhySectionProps) {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#231f20",
        }}>
     
      {/* Text */}
      <Row
        gutter={[48, 48]}
        justify="center"
        align="middle"
        style={{
          marginBottom: "4rem",
          color: "#f5f1ee",
          maxWidth: "1200px",
          margin: "2rem auto 2rem",
        }}
      >
        <Col xs={24} md={12}>
          <span
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.1,
              fontFamily: "Indie Flower",
              display: "block",
            }}
          >
            Per què recomano fer
            <br />
            la sessió d’embaràs?
          </span>
        </Col>

        <Col xs={24} md={12}>
          <div
            style={{
              fontSize: "1.2rem",
              lineHeight: 1.6,
              textAlign: "justify",
            }}
          >
            {textWhyDoThisSession}
          </div>
        </Col>
      </Row>

      {/* Imatge */}
      <Row justify="center">
        <Col xs={24}>
          <div
            style={{
              width: "100%",
              height: "min(70vh, 620px)",
              overflow: "hidden",
            }}
          >
            <img
              src={getPublicPath("/pregnancy/4.jpg")}
              alt="Imatge de la mare embarassada"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
