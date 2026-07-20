type HealthResult =
  | {
      status: 200;
      body: { status: "ok"; checks: { database: "ok" } };
    }
  | {
      status: 503;
      body: { status: "unavailable"; checks: { database: "unavailable" } };
    };

export async function evaluateHealth(databaseProbe: () => Promise<unknown>): Promise<HealthResult> {
  try {
    await databaseProbe();
    return {
      status: 200,
      body: { status: "ok", checks: { database: "ok" } },
    };
  } catch {
    return {
      status: 503,
      body: { status: "unavailable", checks: { database: "unavailable" } },
    };
  }
}
