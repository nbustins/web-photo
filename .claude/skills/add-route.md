# Skill: Add a New Route

Use this skill when only a route + placeholder page is needed (not a full session page).

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

**`src/router/AppRouter.tsx`**
```typescript
import <Name>Page from "@pages/<name>/<name>.page";

// Inside <Routes>:
<Route path={AppRoutes.newRoute} element={<<Name>Page />} />
```

### 4. Add to header navigation (if needed)

**`src/layouts/components/main.header.tsx`**

Find `leftItems` or `rightItems` array and add:
```typescript
{ key: AppRoutes.newRoute, label: "Nav Label" }
```

The header uses `useNavigate()` via `onClick: () => navigate(item.key)`, so just the key is enough.

## Notes

- The router uses `HashRouter` — all links use `#/path` format, no server config needed
- `ScrollToTop` is already applied globally — no need to add it per page
- Use `AppRoutes` enum everywhere, never hardcode path strings
