/** Health check (`GET /api/v1/health`, docs/12 §"Boshqa") — tashqi bog'liqliklar holati. */
export const HealthCheckStatus = {
  UP: 'up',
  DOWN: 'down',
} as const;

export type HealthCheckStatus = (typeof HealthCheckStatus)[keyof typeof HealthCheckStatus];

export interface HealthChecks {
  database: HealthCheckStatus;
  redis: HealthCheckStatus;
}

/** `200` javob. Biror tekshiruv `down` bo'lsa — `503` va `error.details.checks` (docs/12 §0 formati). */
export interface HealthResponse {
  status: 'ok';
  checks: HealthChecks;
}
