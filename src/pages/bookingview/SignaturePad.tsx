import { useEffect, useRef, useState } from 'react';
import { primitives } from '@styles/tokens';
import styles from './SignaturePad.module.css';

// Canvas 2D strokeStyle no pot llegir custom properties CSS: cal el valor real.
const INK = primitives.ink800;

interface SignaturePadProps {
  /** Fires with the PNG data URL after each stroke, and with null when cleared. */
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}

/**
 * Signature capture on a printed rule (API spec 010 B2). Hand-rolled on a canvas: pointer
 * events cover mouse, pen and touch, so no signature library is needed.
 */
export const SignaturePad = ({ onChange, disabled }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  // The canvas is sized in device pixels so the stroke stays crisp on retina and after a resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * ratio;
      canvas.height = height * ratio;

      const ctx = canvas.getContext('2d')!;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = INK;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const pointAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pointAt(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pointAt(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setHasInk(true);
    onChange(canvasRef.current!.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        aria-label="Àrea per signar amb el dit o el ratolí"
        className={disabled ? `${styles.canvas} ${styles.canvasDisabled}` : styles.canvas}
      />
      <div className={styles.footer}>
        <span>{hasInk ? 'Signatura del client' : 'Signa aquí amb el dit o el ratolí'}</span>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className={hasInk ? `${styles.clearButton} ${styles.clearButtonActive}` : styles.clearButton}
        >
          Esborra
        </button>
      </div>
    </div>
  );
};
