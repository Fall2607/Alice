import { NextRequest, NextResponse } from "next/server";
import { calculateAbsensiRekap } from "@/app/lib/absensiRekap";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const unitParam = searchParams.get("unit"); // departemen_id or 'all'
    const superiorId = searchParams.get("superior_id") || searchParams.get("superiorId");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ message: "Parameter startDate dan endDate wajib diisi." }, { status: 400 });
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }

    const result = await calculateAbsensiRekap({
      startDate: startDateParam,
      endDate: endDateParam,
      unit: unitParam,
      superiorId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error fetching rekap absensi:", err);
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
  }
}
