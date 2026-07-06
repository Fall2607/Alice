import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { PATCH } from "../[id]/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action"); // 'APPROVE' or 'REJECT'

  if (!token || !action) {
    return NextResponse.json({ message: "Link tidak valid: Token atau Action hilang." }, { status: 400 });
  }

  if (!['APPROVE', 'REJECT'].includes(action)) {
    return NextResponse.json({ message: "Aksi tidak dikenali." }, { status: 400 });
  }

  let payload: any;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    return NextResponse.json({ message: "Token sudah kadaluarsa atau tidak valid." }, { status: 401 });
  }

  const { cuti_id, approver_id } = payload;
  if (!cuti_id || !approver_id) {
    return NextResponse.json({ message: "Payload token tidak lengkap." }, { status: 400 });
  }

  // Panggil PATCH handler secara langsung tanpa HTTP fetch (mencegah loopback network error)
  try {
    const mockRequest = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        approver_id,
        approver_role: payload.role
      })
    });

    const patchRes = await PATCH(mockRequest, { params: Promise.resolve({ id: cuti_id }) });

    if (!patchRes.ok) {
      const errorData = await patchRes.json();
      const errorHtml = `
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #f8fafc;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: inline-block; max-width: 500px;">
              <h1 style="color: #ef4444">Gagal Memproses</h1>
              <p style="color: #64748b; font-size: 16px;">${errorData.message || 'Terjadi kesalahan'}</p>
            </div>
          </body>
        </html>
      `;
      return new NextResponse(errorHtml, { status: patchRes.status, headers: { "Content-Type": "text/html" } });
    }

    const htmlResponse = `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #f8fafc;">
          <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: inline-block; max-width: 500px;">
            <h1 style="color: ${action === 'APPROVE' ? '#10b981' : '#ef4444'}">
              ${action === 'APPROVE' ? 'Persetujuan Berhasil' : 'Penolakan Berhasil'}
            </h1>
            <p style="color: #64748b; font-size: 16px;">
              Tindakan Anda telah dicatat ke dalam sistem HRIS. Anda bisa menutup tab ini.
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      status: 200,
      headers: { "Content-Type": "text/html" }
    });

  } catch (error) {
    console.error("Magic approve error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal." }, { status: 500 });
  }
}
