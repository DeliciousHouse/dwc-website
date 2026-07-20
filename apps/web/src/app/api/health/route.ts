import { getPrisma } from "@/lib/db";
import { evaluateHealth } from "@/lib/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result = await evaluateHealth(() => getPrisma().$queryRaw`SELECT 1`);

  return Response.json(result.body, {
    status: result.status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
