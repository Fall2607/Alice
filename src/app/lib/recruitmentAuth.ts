import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import pool from "@/app/lib/db";

interface JwtPayload {
  readonly userId?: string;
  readonly karyawanId?: string | null;
  readonly roleId?: string;
  readonly name?: string;
  readonly role?: string;
}

export interface MenuPermissionFlags {
  readonly canView: boolean;
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
}

export interface AuthenticatedAdminUser {
  readonly userId: string;
  readonly karyawanId: string | null;
  readonly roleId: string;
  readonly name: string;
  readonly roleName: string;
  readonly isHcLowonganManager: boolean;
  readonly canViewLowongan: boolean;
  readonly isHcJobPositionManager: boolean;
}

const EMPTY_FLAGS: MenuPermissionFlags = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

const HC_ROLE_NAMES = new Set(["Admin", "HRD", "Super Admin"]);

function extractBearerToken(request: Request | NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

/**
 * Memverifikasi JWT admin pada header Authorization dan mengambil hak akses
 * aktual dari tabel role_menu_access sehingga otorisasi tidak hanya mengandalkan payload klien.
 */
export async function verifyAdminRequest(
  request: Request | NextRequest
): Promise<AuthenticatedAdminUser | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET belum dikonfigurasi pada environment server.");
    return null;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }

  if (!decoded.userId || !decoded.roleId) return null;

  const userRes = await pool.query(
    `SELECT
       u.id AS user_id,
       u.karyawan_id,
       u.role_id,
       COALESCE(k.nama_lengkap, u.email) AS nama_lengkap,
       COALESCE(r.nama_role, '') AS nama_role
     FROM public.users u
     LEFT JOIN public.karyawan k ON u.karyawan_id = k.id
     LEFT JOIN public.roles r ON u.role_id = r.id
     WHERE u.id = $1
     LIMIT 1`,
    [decoded.userId]
  );

  if (userRes.rows.length === 0) return null;

  const row = userRes.rows[0];
  const roleId: string = row.role_id;
  const roleName: string = row.nama_role || "";

  const permRes = await pool.query(
    `SELECT m.path, rma.can_view, rma.can_create, rma.can_edit, rma.can_delete
     FROM public.role_menu_access rma
     INNER JOIN public.menus m ON rma.menu_id = m.id
     WHERE rma.role_id = $1
       AND m.path IN ('/admin/lowongan', '/admin/job-positions')`,
    [roleId]
  );

  const permsByPath: Record<string, MenuPermissionFlags> = {};
  for (const perm of permRes.rows) {
    permsByPath[perm.path] = {
      canView: Boolean(perm.can_view),
      canCreate: Boolean(perm.can_create),
      canEdit: Boolean(perm.can_edit),
      canDelete: Boolean(perm.can_delete),
    };
  }

  const lowonganPerm = permsByPath["/admin/lowongan"] ?? EMPTY_FLAGS;
  const jobPosPerm = permsByPath["/admin/job-positions"] ?? EMPTY_FLAGS;
  const isHcRole = HC_ROLE_NAMES.has(roleName);

  const isHcLowonganManager =
    isHcRole ||
    lowonganPerm.canCreate ||
    lowonganPerm.canEdit ||
    lowonganPerm.canDelete;

  const isHcJobPositionManager =
    isHcRole ||
    jobPosPerm.canCreate ||
    jobPosPerm.canEdit ||
    jobPosPerm.canDelete;

  return {
    userId: row.user_id,
    karyawanId: row.karyawan_id ?? null,
    roleId,
    name: row.nama_lengkap,
    roleName,
    isHcLowonganManager,
    canViewLowongan: isHcLowonganManager || lowonganPerm.canView,
    isHcJobPositionManager,
  };
}

/**
 * Mengecek apakah user memiliki akses melihat/menilai lowongan tertentu:
 * - HC Manager: seluruh lowongan
 * - Non-HC (Koordinator / SPV / Wadir): hanya lowongan dari pengajuan sendiri atau bawahannya
 */
export async function canUserAccessJobOpening(options: {
  user: AuthenticatedAdminUser;
  jobOpeningId: string;
}): Promise<boolean> {
  const { user, jobOpeningId } = options;
  if (user.isHcLowonganManager) return true;
  if (!user.canViewLowongan || !user.karyawanId) return false;

  const res = await pool.query(
    `WITH RECURSIVE subordinates AS (
       SELECT id, 0 AS depth
       FROM public.karyawan
       WHERE id = $1
       UNION ALL
       SELECT k.id, s.depth + 1
       FROM public.karyawan k
       INNER JOIN subordinates s ON k.atasan_id = s.id
       WHERE s.depth < 15
     )
     SELECT 1
     FROM public.job_openings jo
     INNER JOIN public.employee_requests er ON jo.request_id = er.id
     INNER JOIN subordinates sub ON er.requester_id = sub.id
     WHERE jo.id = $2
     LIMIT 1`,
    [user.karyawanId, jobOpeningId]
  );

  return (res.rowCount ?? 0) > 0;
}

