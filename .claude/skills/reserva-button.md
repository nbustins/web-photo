# Reserva Button

Use this skill when adding a "Reserva" CTA button that links to an external URL (e.g. Google Forms booking).

---

## When to use

- A page needs a prominent booking/reservation call-to-action
- The destination is an external URL (not an internal route)

For internal navigation (React Router), use `<Button type="primary" onClick={() => navigate(...)}>`  instead.

---

## Pattern

```tsx
import { Button } from "antd";

<Button
  type="primary"
  size="large"
  href="https://..."
  target="_blank"
  rel="noopener noreferrer"
  style={{ padding: "0 48px", height: 48 }}
>
  Reserva
</Button>
```

Wrap in a centered `<div style={{ textAlign: "center", marginTop: 32 }}>` with a `motion.div` fadeUp animation.

---

## Rules

- Always use Ant Design `<Button type="primary">` — never a raw `<a>` tag styled as a button
- Use `href` + `target="_blank"` + `rel="noopener noreferrer"` for external links
- Do **not** override border-radius, color, or font — these come from the global ConfigProvider (`999px` pill, `#7C7458`)
- Size: `size="large"` with `padding: "0 48px"` and `height: 48` for a prominent CTA
- Always animate with the standard `fadeUp` variant and `viewport={{ once: true }}`
