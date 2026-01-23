import Button from "antd/es/button";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router";
import { AppRoutes } from "../../../model/routes.model";

export interface StoreBookProps {
  title: string;
  text: string;
  buttonText: string;
}

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 320,
  height: 54,
  borderRadius: 999,
  fontSize: "1.1rem",
  fontWeight: 600,
};

export const StoreBook = (data: StoreBookProps) => {

  const navigate = useNavigate();

return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      padding: "32px 36px",
      borderRadius: 18,
      background: "linear-gradient(180deg, #fffdf7 0%, #fbf6ea 100%)",
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Detall decoratiu (paper) */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 10,
        background: "linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0))",
      }}
    />

    {/* Contingut */}
    <div style={{ textAlign: "center" }}>
      <Title
        level={3}
        style={{
          marginTop: 0,
          marginBottom: 8,
          fontFamily: "Italiana",
          letterSpacing: "1px",
        }}
      >
        {data.title}
      </Title>

      {/* separador */}
      <div
        style={{
          width: 80,
          height: 2,
          margin: "10px auto 22px",
          background: "rgba(0,0,0,0.15)",
          borderRadius: 2,
        }}
      />
    </div>

    <Paragraph
      style={{
        fontSize: "1.1rem",
        textAlign: "justify",
        lineHeight: 1.8,
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "rgba(0,0,0,0.82)",
        marginBottom: 0,
      }}
    >
      {data.text}
    </Paragraph>

    {/* Footer */}
    <div
      style={{
        marginTop: "auto",
        paddingTop: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >

      <Button
        type="primary"
        style={{
          ...submitButtonStyle,
          padding: "10px 22px",
          height: "auto",
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.5px",
          boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
        }}
        onClick={() => navigate(AppRoutes.bookStore)}
      >
        {data.buttonText}
      </Button>
    </div>
  </div>
);

};