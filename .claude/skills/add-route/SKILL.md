---
name: add-route
description: Use when adding a new route with only a placeholder/minimal page — not a full photography session page (use new-session-page for that) and not a wedding page (use new-wedding-page for that).
---

# Add a new route

## Steps

### 1. Add to the enum

**`src/model/routes.model.ts`**
```typescript
export enum AppRoutes {
  // ...
  newRoute = "/new-route",
}
```

### 2. Create a minimal page component

**`src/pages/<name>/<name>.page.tsx`**
```typescript
export default function <Name>Page() {
  return (
    <div style={{ padding: "24px" }}>
      {/* Page content */}
    </div>
  );
}
```

### 3. Register in the router

**`src/router/AppRouter.tsx`** — add the component to the `privateRoutes` map
(it's rendered inside `MainLayout` automatically):

```typescript
import <Name>Page from "@pages/<name>/<name>.page";

const privateRoutes: Partial<Record<AppRoutes, FC>> = {
  // ...
  [AppRoutes.newRoute]: () => <<Name>Page/>,
};
```

### 4. Add to header navigation (if needed)

**`src/layouts/components/main.header.tsx`**

Find the `items` array (`MenuItem[]`) and add an entry:
```typescript
{ label: "Nav Label", key: AppRoutes.newRoute }
```
The header derives the selected key from `pathname` and navigates via
`navigate(e.key)` — the enum value is enough, no extra wiring needed. Items
before index 3 render on the left, index 3+ on the right (desktop); mobile
uses the same array in a drawer `Menu`.

## Notes

- The router uses `HashRouter` — all links use `#/path` format, no server
  config needed.
- `ScrollToTop` is already applied globally in `AppRouter.tsx` — don't add it
  per page.
- Use the `AppRoutes` enum everywhere, never hardcode path strings.
