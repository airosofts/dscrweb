import { NextRequest } from "next/server";
import { clientIp, geolocate } from "@/lib/geo";

/**
 * GET /api/geo — resolve the caller's IP to a location.
 * Used by the mobile app at session start to record where users are.
 * Returns { ip, country, region, city }.
 */
export async function GET(request: NextRequest) {
  const ip = clientIp(request.headers);
  if (!ip) {
    return Response.json({ ip: null, country: null, region: null, city: null });
  }
  return Response.json(await geolocate(ip));
}
