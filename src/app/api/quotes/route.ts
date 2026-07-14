import { NextResponse } from "next/server";

import { handleQuotesRequest } from "@/modules/rates/server/handleQuotesRequest";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request): Promise<NextResponse> {
  // Malformed JSON becomes a null payload, which the shared schema rejects
  // with the same 400 shape as any other invalid input.
  const payload: unknown = await request.json().catch(() => null);

  const { status, body, delayMs } = handleQuotesRequest(payload);

  if (delayMs > 0) {
    await sleep(delayMs);
  }

  return NextResponse.json(body, { status });
}
