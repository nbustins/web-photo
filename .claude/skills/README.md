# Project Skills

Skills for the photographer studio website. Reference these when building new features.

| Skill | When to use |
|-------|-------------|
| [new-session-page.md](new-session-page.md) | Adding a new photography session type (full page with hero, gallery, pricing, FAQs) |
| [add-route.md](add-route.md) | Adding a new route + minimal page without the full session structure |
| [design-system.md](design-system.md) | Colors, typography, spacing, animation — check before adding any new styles |
| [shared-components.md](shared-components.md) | API reference for all existing reusable components |

## Tech stack summary

- **React 19** + **TypeScript** + **Vite**
- **React Router 7** with `HashRouter`
- **Ant Design 5** for UI components and grid
- **Framer Motion** for animations
- Routes defined as enum in `src/model/routes.model.ts`
- Aliases: `@components`, `@pages`, `@layouts`, `@utils`, `@hooks`
