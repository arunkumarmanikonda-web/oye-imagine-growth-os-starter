import { NextResponse } from "next/server"

import { seedNeejeeCommercialState } from "@/lib/commercial/store"

export async function POST() {
  return NextResponse.json(seedNeejeeCommercialState())
}