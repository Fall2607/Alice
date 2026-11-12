"use client";

export interface StoredAdminUser {
  readonly id: string;
  readonly karyawan_id: string | null;
  readonly role_id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
}

export function getAuthHeaders(
  extraHeaders: Record<string, string> = {}
): Record<string, string> {
  if (typeof window === "undefined") return { ...extraHeaders };
  const token = localStorage.getItem("authToken");
  if (!token) return { ...extraHeaders };
  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function getStoredAdminUser(): StoredAdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAdminUser;
  } catch {
    return null;
  }
}

