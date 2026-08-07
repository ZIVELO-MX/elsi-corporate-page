import { NextResponse } from "next/server";
import { getCardPaymentsEnabled } from "@/lib/payment-settings";

export async function GET() {
  return NextResponse.json({ cardEnabled: await getCardPaymentsEnabled() });
}
