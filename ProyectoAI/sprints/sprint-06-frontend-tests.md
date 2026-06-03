# Sprint 6 — Frontend Completo y Tests

## Bounded Context
market-web-react

## Duracion Estimada
3-5 dias

## Dependencias
Sprint 5 completado (autenticacion funcionando)

---

## Tarea 6.1 — Setup Testing

1. npm.cmd install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
2. vitest.config.js con environment jsdom, globals: true
3. src/test/setup.js con import de @testing-library/jest-dom
4. package.json: scripts test, test:coverage, test:ui

## Tarea 6.2 — Tests de Componentes

Crear tests para:
1. OfferCard.test.jsx — renderiza titulo, precio, foodCondition
2. StateViews.test.jsx — LoadingState, ErrorState, EmptyState con y sin action
3. BottomNav.test.jsx — renderiza 5 items de navegacion
4. SectionHeader.test.jsx — renderiza titulo y subtitulo
5. MetricCard.test.jsx — renderiza label y valor

## Tarea 6.3 — Tests de Hooks

1. useMarketplaceData.test.js — mocks api.js, verifica estados loading/error/success
2. useMarketplaceSession.test.js — verifica carga de perfiles y roles
3. useToast.test.js — verifica showToast y auto-dismiss

## Tarea 6.4 — Mejoras UX

1. Loading/Error/Empty states en todas las paginas
2. Toast con tipos (success, error, info, warning) con colores
3. Responsive: 3 breakpoints (375px, 768px, 1280px)
4. Accesibilidad: aria-labels, role="alert", contraste, focus styles
5. Confirm dialog antes de acciones destructivas

## Tarea 6.5 — Error Handling

1. api.js: detectar "Failed to fetch", mostrar mensaje amigable
2. Timeout en fetch (AbortController) para requests lentos

## Verificacion
```bash
cd market-web-react
npm.cmd test

npm.cmd run test:coverage

npm.cmd run build
```
