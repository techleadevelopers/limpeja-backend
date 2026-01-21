// Shared configuration for routes we want to treat as critical/high visibility.
const CRITICAL_ROUTES = [
  'api/search',
  'api/bookings',
  'api/payments',
  'api/payouts',
  'api/auth',
  'api/safety',
];

// Exposed list for sampling prefixes in the interceptor.
export const CRITICAL_ROUTE_PREFIXES = [...CRITICAL_ROUTES];

// Explicit routes that the admin health page should surface.
export const LATENCY_CRITICAL_ROUTES = [...CRITICAL_ROUTES];
