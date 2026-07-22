import { FC, useEffect, useState } from "react";
import { Alert, Card, Col, Row, Skeleton } from "antd";
import PricingCard from "./pricingCardComponent";
import { SessionType, fetchSessionTypesByGroup } from "../services/booking/booking.api";

/**
 * A service page's pricing cards, straight from the API (API spec 007). The page only knows its
 * session group id — price, features and advice note are edited in admin, not deployed.
 *
 * No hardcoded fallback on purpose (007 QC6): a stale copy of the catalog would recreate exactly
 * the drift this replaced.
 */
export const SessionPricingCards: FC<{ sessionGroupId: number }> = ({ sessionGroupId }) => {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchSessionTypesByGroup(sessionGroupId)
      .then((types) => { if (!cancelled) setSessionTypes(types); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sessionGroupId]);

  if (loading) {
    return (
      <Row gutter={[24, 24]} justify="center" align="stretch">
        {[0, 1, 2].map((i) => (
          <Col xs={24} md={8} key={i}>
            <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (failed) {
    return (
      <Row justify="center">
        <Col xs={24} md={16}>
          <Alert
            type="warning"
            showIcon
            message="No s'han pogut carregar les tarifes"
            description="Torna-ho a provar d'aquí una estona o escriu-nos i te les passem."
          />
        </Col>
      </Row>
    );
  }

  // ponytail: card width by count — 3-up at a third, fewer cards get a bit wider so a 2-card
  // page (Familiar, Smash Cake) does not look like a 3-card row missing one.
  const span = sessionTypes.length >= 3 ? 8 : 10;

  return (
    <Row gutter={[24, 24]} justify="center" align="stretch">
      {sessionTypes.map((type) => (
        <Col xs={24} md={span} key={type.id}>
          <PricingCard
            sessionTypeId={type.id}
            title={type.name}
            features={type.features}
            adviceText={type.adviceText}
            price={type.price}
          />
        </Col>
      ))}
    </Row>
  );
};

export default SessionPricingCards;
