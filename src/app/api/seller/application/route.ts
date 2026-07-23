import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DETAIL =
  "Seller application persistence contract is not present in this repository. No seller table, migration, caller, or prior implementation was found.";

function notImplemented() {
  return NextResponse.json(
    {
      ok: false,
      error: "Not Implemented",
      detail: DETAIL,
      route: "/api/seller/application",
    },
    {
      status: 501,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET() {
  return notImplemented();
}

export async function POST(_request: Request) {
  return notImplemented();
}