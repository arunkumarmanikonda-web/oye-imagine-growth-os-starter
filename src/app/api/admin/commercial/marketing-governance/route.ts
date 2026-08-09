import { NextResponse } from "next/server";
import { getPaidMediaGovernanceExperience } from "@/lib/recovery/paid-media-governance-foundation";

export async function GET() {
  return NextResponse.json(getPaidMediaGovernanceExperience());
}
