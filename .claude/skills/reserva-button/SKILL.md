---
name: reserva-button
description: Use when adding a "Reserva" call-to-action button that links to an external URL (e.g. a Google Forms booking link). For internal navigation to an app route, use React Router's navigate() with a plain antd Button instead.
---

# Reserva button

## When to use

- A page needs a prominent booking/reservation call-to-action.
- The destination is an external URL (not an internal route).

For internal navigation, use `<Button type="primary" onClick={() => navigate(...)}>`
instead — never this pattern for an in-app route.

## Pattern

```tsx
import { Button } from "antd";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  style={{ textAlign: "center", marginTop: 32 }}
>
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
</motion.div>
```

## Rules

- Always use Ant Design `<Button type="primary">` — never a raw `<a>` tag
  styled as a button.
- Use `href` + `target="_blank"` + `rel="noopener noreferrer"` for external
  links.
- Do **not** override border-radius, color, or font — these come from the
  global `ConfigProvider` theme (see `.claude/rules/styling.md` → Buttons):
  `999px` pill, brand color.
- Size: `size="large"` with `padding: "0 48px"` and `height: 48` for a
  prominent CTA.
- Always animate with the standard `fadeUp` variant and
  `viewport={{ once: true }}` (see `.claude/rules/styling.md` → Animation).
