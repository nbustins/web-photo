import { Typography } from "antd";

const { Title } = Typography;

export function AboutMeTitle({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ textAlign: "left", marginBottom: "0px" }}>
      <div
        style={{
          fontSize: "clamp(1.6rem, 3vw, 4rem)",
          letterSpacing: "0.2rem",
          marginBottom: "clamp(-0.4rem, -3vw, -1rem)",
          fontFamily: "Italiana",
          color: "rgb(174,	142,116)",

        }}
      >
        {label}
      </div>

      <Title
        level={1}
        style={{
          fontSize: "clamp(3rem,5vw,5rem)",
          fontWeight: 700,
          lineHeight: "1.1",
          margin: 0,
          fontFamily: "Italiana",
          letterSpacing: "0.3rem",
          color: "rgb(174,	142,116)",

        }}
      >
        {title}
      </Title>
    </div>
  );
}
