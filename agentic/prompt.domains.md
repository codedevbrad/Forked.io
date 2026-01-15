# Domain Architecture Pattern

## Overview

Domains are self-contained modules that organize related functionality, data access, and UI components. Each domain encapsulates a specific business capability (e.g., `user`, `organisation`, `product`).

## Directory Structure

```
src/domains/
  {domain-name}/
    / _components/          # Domain-specific React components
    / _contexts/            # SWR hooks for data fetching
    / _documentation/       # Domain-specific docs (optional)
    / db/                   # Server actions and database operations
      index.ts
```

## Core Principles

1. **Separation of Concerns**: Each domain manages its own data, components, and business logic
2. **Server Actions**: All database operations are server actions in the `db/` directory
3. **Client Hooks**: Data fetching uses SWR hooks in `_contexts/` directory
4. **Component Isolation**: Domain components live in `_components/` and can be reused across the app


### Optional Directories

- `_documentation/` - Domain-specific documentation
- `types/` - Domain-specific TypeScript types (if needed)
- `utils/` - Domain-specific utility functions (if needed)

### Error Handling

- Server actions should catch errors  
- SWR hooks automatically handle errors - expose them in the return value
- Components should display user-friendly error messages

### Type Safety

- Define types  
- Use Prisma's generated types for database entities
- Export types from `db/index.ts` for use in components

### Testing Considerations

- Server actions can be tested independently
- SWR hooks can be mocked in component tests
- Components can be tested with mocked hooks

---

## Summary Checklist

When creating a new domain:

- [ ] Create domain directory: `src/domains/{domain-name}/`
- [ ] Add `db/index.ts` with `"use server"` and server actions
- [ ] Add `_contexts/use{Resource}.ts` with SWR hooks
- [ ] Add `_components/` with domain-specific components
- [ ] Use `ActionResult<T>` type for mutations
- [ ] Invalidate SWR cache after mutations
- [ ] Handle loading, error, and empty states in components
- [ ] Use `useTransition` for mutations
- [ ] Follow naming conventions consistently

