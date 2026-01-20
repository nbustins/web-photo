import Button from "antd/es/button";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

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

export const StoreBook = (data: StoreBookProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      padding: "60px",
    }}
  >
    <Title level={3} style={{ marginTop: 0, fontFamily: "Italiana" }}>
      {data.title}
    </Title>

    <Paragraph style={{ fontSize: "1.1rem", textAlign:"justify" }}>{data.text}</Paragraph>

    {/* boto al final */}
    <div style={{ marginTop: "auto", display: "flex", justifyContent: "center" }}>
      <Button type="primary" style={submitButtonStyle}>
        {data.buttonText}
      </Button>
    </div>
  </div>
);
