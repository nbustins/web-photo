import { FC, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SESSIONS } from "../model/sessions";
import { getPublicPath } from "../utils/pathUtils";
import styles from "./sessionStrip.module.css";

/**
 * Tira de sessions: graella de 5 a desktop, pista amb scroll-snap a mòbil.
 * Els punts només es veuen a mòbil (els amaga el CSS), així que aquí no cal
 * cap condicional de mida.
 */
export const SessionStrip: FC = () => {
  const trackRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      // Per posició real de cada targeta: la targeta no ocupa tota la pista
      // (68% + gap), així que dividir per l'amplada donaria índexs equivocats.
      const cards = Array.from(track.children) as HTMLElement[];
      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft - track.scrollLeft);
        if (distance < best) {
          best = distance;
          nearest = index;
        }
      });
      setActive(nearest);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.wrap}>
      <nav className={styles.strip} aria-label="Sessions" ref={trackRef}>
        {SESSIONS.map((session) => (
          <Link
            key={session.key}
            to={session.key}
            className={styles.card}
            style={{ backgroundImage: `url(${getPublicPath(session.cover)})` }}
          >
            <span className={styles.label}>
              <span className={styles.name}>{session.label}</span>
              <span className={styles.caption}>{session.caption}</span>
            </span>
          </Link>
        ))}
      </nav>

      {/* Decoratius: la navegació de veritat són els enllaços de sobre. */}
      <div className={styles.dots} aria-hidden="true">
        {SESSIONS.map((session, index) => (
          <span
            key={session.key}
            className={`${styles.dot}${index === active ? ` ${styles.dotActive}` : ""}`}
          />
        ))}
      </div>
    </div>
  );
};
