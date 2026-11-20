"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback, MouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}
import {
  Network,
  Search,
  Loader2,
  User,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Building2,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  X,
  Phone,
  Mail,
  Crown,
  ShieldCheck,
  UserCheck,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import Modal from "@/app/components/modal";

interface KaryawanNode {
  id: string;
  nip?: string;
  nama_lengkap: string;
  atasan_id: string | null;
  nama_departemen: string | null;
  nama_level: string | null;
  nama_jabatan?: string | null;
  profesi?: string | null;
  email?: string | null;
  handphone?: string | null;
  jenis_kelamin?: string;
  children?: KaryawanNode[];
  tier?: number;
  isDummy?: boolean;
}

type FormOption = { value: string; label: string };
type ViewMode = "tree" | "levels" | "departments";

const getTier = (nama_level: string | null): number => {
  const level = (nama_level || "").toLowerCase();
  if (level.includes("direktur") && !level.includes("wakil")) return 1;
  if (level.includes("wakil direktur") || level.includes("wadir")) return 2;
  if (level.includes("supervisor") || level.includes("spv") || level.includes("kepala bidang")) return 3;
  if (level.includes("koordinator") || level.includes("koor") || level.includes("kepala ruangan")) return 4;
  return 5; // Staff, Komite, Pelaksana, dll
};

const getTierInfo = (tier?: number) => {
  switch (tier) {
    case 1:
      return {
        label: "Direktur Eksekutif",
        badgeBg: "bg-indigo-600 text-white",
        avatarBg: "bg-indigo-600 ring-2 ring-indigo-200",
        border: "border-indigo-400 shadow-indigo-100",
        icon: Crown,
      };
    case 2:
      return {
        label: "Wakil Direktur",
        badgeBg: "bg-[#05445e] text-white",
        avatarBg: "bg-[#05445e] ring-2 ring-blue-200",
        border: "border-sky-500 shadow-sky-50",
        icon: ShieldCheck,
      };
    case 3:
      return {
        label: "Supervisor / SPV",
        badgeBg: "bg-[#0173b6] text-white",
        avatarBg: "bg-[#0173b6] ring-2 ring-blue-100",
        border: "border-blue-400 shadow-blue-50",
        icon: UserCheck,
      };
    case 4:
      return {
        label: "Koordinator Unit",
        badgeBg: "bg-teal-600 text-white",
        avatarBg: "bg-teal-600 ring-2 ring-teal-100",
        border: "border-teal-400 shadow-teal-50",
        icon: Briefcase,
      };
    default:
      return {
        label: "Staf / Pelaksana",
        badgeBg: "bg-slate-100 text-slate-700",
        avatarBg: "bg-slate-400",
        border: "border-slate-200",
        icon: User,
      };
  }
};

export default function StrukturOrganisasiPage() {
  const [rawData, setRawData] = useState<KaryawanNode[]>([]);
  const [treeData, setTreeData] = useState<KaryawanNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<FormOption | null>(null);
  const [selectedLevelTier, setSelectedLevelTier] = useState<FormOption | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  // Collapse / Expand state for Tree Nodes
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Modal Detail State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<KaryawanNode | null>(null);

  // Canvas State for Pan & Zoom
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch Org Chart Data
  const fetchOrgChart = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/personalia/org-chart");
      const resData = await res.json();

      if (!res.ok) {
        throw new Error(
          resData?.message || `Gagal memuat data (Status HTTP ${res.status}).`
        );
      }

      if (!Array.isArray(resData)) {
        console.error("Invalid API Response:", resData);
        throw new Error("Format respon data organisasi dari server tidak valid.");
      }

      // Clone array and assign tiers
      const processed: KaryawanNode[] = resData.map((k: KaryawanNode) => ({
        ...k,
        tier: getTier(k.nama_level),
        children: [],
      }));

      // Relasi Wadir Treatment (khusus hierarki RSU Avisena)
      const wadirNode = processed.find((k) => k.tier === 2);
      const direkturNode = processed.find((k) => k.tier === 1);
      if (wadirNode && direkturNode) {
        if (!wadirNode.atasan_id) {
          wadirNode.atasan_id = direkturNode.id;
        }
        processed.forEach((k) => {
          if (k.tier === 3 && k.atasan_id === direkturNode.id) {
            k.atasan_id = wadirNode.id;
          }
        });
      }

      setRawData(processed);

      // Build Hierarchical Tree
      const map = new Map<string, KaryawanNode>();
      processed.forEach((k) => map.set(k.id, { ...k, children: [] }));

      const initialRoots: KaryawanNode[] = [];
      map.forEach((node) => {
        if (
          node.atasan_id &&
          node.atasan_id !== node.id &&
          map.has(node.atasan_id)
        ) {
          map.get(node.atasan_id)!.children!.push(node);
        } else {
          initialRoots.push(node);
        }
      });

      // Fallback: Jika semua atasan_id mengarah secara tertutup, ambil tier tertinggi sebagai roots
      if (initialRoots.length === 0 && processed.length > 0) {
        const minTier = Math.min(...processed.map((k) => k.tier || 5));
        processed
          .filter((k) => (k.tier || 5) === minTier)
          .forEach((k) => {
            if (map.has(k.id)) {
              initialRoots.push(map.get(k.id)!);
            }
          });
      }

      // Urutkan akar pohon agar Direktur (Tier 1) selalu berada di urutan teratas
      initialRoots.sort((a, b) => (a.tier || 5) - (b.tier || 5));

      // Inject Dummy Nodes to bridge skipped levels cleanly
      const processNodeDummies = (node: KaryawanNode) => {
        if (!node.children || node.children.length === 0) return;

        const dummyMap = new Map<number, KaryawanNode>();
        const newChildren: KaryawanNode[] = [];

        node.children.forEach((child) => {
          const childTier = child.tier || 5;
          const parentTier = node.tier || 1;

          if (childTier > parentTier + 1) {
            let firstDummy = dummyMap.get(parentTier + 1);
            if (!firstDummy) {
              firstDummy = {
                id: `dummy_${node.id}_tier_${parentTier + 1}`,
                nama_lengkap: `Dummy ${parentTier + 1}`,
                atasan_id: node.id,
                nama_departemen: null,
                nama_level: null,
                tier: parentTier + 1,
                isDummy: true,
                children: [],
              };
              dummyMap.set(parentTier + 1, firstDummy);
              newChildren.push(firstDummy);
            }
            firstDummy.children!.push(child);
          } else {
            newChildren.push(child);
          }
        });

        node.children = newChildren;
        node.children.forEach((c) => processNodeDummies(c));
      };

      initialRoots.forEach((r) => processNodeDummies(r));
      setTreeData(initialRoots);
    } catch (err: unknown) {
      console.error("Gagal memuat data struktur organisasi:", err);
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.";
      setErrorMessage(msg);
      setRawData([]);
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgChart();
  }, [fetchOrgChart]);

  // Department Options for SearchableSelect
  const departmentOptions: FormOption[] = useMemo(() => {
    const depts = new Set<string>();
    rawData.forEach((k) => {
      if (k.nama_departemen) depts.add(k.nama_departemen);
    });
    const sorted = Array.from(depts).sort((a, b) => a.localeCompare(b));
    return [
      { value: "all", label: "Semua Unit / Departemen" },
      ...sorted.map((d) => ({ value: d, label: d })),
    ];
  }, [rawData]);

  const levelTierOptions: FormOption[] = useMemo(
    () => [
      { value: "all", label: "Semua Tingkatan Level" },
      { value: "1", label: "Direktur Eksekutif (Tier 1)" },
      { value: "2", label: "Wakil Direktur (Tier 2)" },
      { value: "3", label: "Supervisor / SPV (Tier 3)" },
      { value: "4", label: "Koordinator Unit (Tier 4)" },
      { value: "5", label: "Staf / Pelaksana (Tier 5)" },
    ],
    []
  );

  // Executive KPI Statistics
  const stats = useMemo(() => {
    const totalEmployees = rawData.length;
    const directorsCount = rawData.filter((k) => k.tier === 1 || k.tier === 2).length;
    const supervisorsCount = rawData.filter((k) => k.tier === 3 || k.tier === 4).length;
    const staffCount = rawData.filter((k) => (k.tier || 5) >= 5).length;

    const uniqueDepts = new Set<string>();
    rawData.forEach((k) => {
      if (k.nama_departemen) uniqueDepts.add(k.nama_departemen);
    });

    // Average span of control (bawahan per pimpinan)
    const leadersCount = directorsCount + supervisorsCount;
    const spanOfControl =
      leadersCount > 0 ? (staffCount / leadersCount).toFixed(1) : "-";

    return {
      totalEmployees,
      directorsCount,
      supervisorsCount,
      staffCount,
      totalDepts: uniqueDepts.size,
      spanOfControl,
    };
  }, [rawData]);

  // Collapse / Expand handlers
  const toggleCollapse = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setCollapsedIds(new Set());
  };

  const handleCollapseToManagers = () => {
    const idsToCollapse = new Set<string>();
    rawData.forEach((k) => {
      if ((k.tier || 5) >= 4) {
        idsToCollapse.add(k.id);
      }
    });
    setCollapsedIds(idsToCollapse);
  };

  // Drag & Canvas Handlers
  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest(".org-card-clickable")) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.35));
  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleOpenDetail = (node: KaryawanNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveEmployee(node);
    setIsDetailModalOpen(true);
  };

  // Find direct superior and subordinates for modal
  const activeEmployeeRelations = useMemo(() => {
    if (!activeEmployee) return { atasan: null, bawahan: [] };
    const atasan = rawData.find((k) => k.id === activeEmployee.atasan_id) || null;
    const bawahan = rawData.filter((k) => k.atasan_id === activeEmployee.id);
    return { atasan, bawahan };
  }, [activeEmployee, rawData]);

  // Filtered raw list for Accordion & Department matrix views
  const filteredList = useMemo(() => {
    return rawData.filter((k) => {
      const term = searchQuery.toLowerCase().trim();
      const matchSearch =
        !term ||
        k.nama_lengkap.toLowerCase().includes(term) ||
        (k.nip && k.nip.toLowerCase().includes(term)) ||
        (k.nama_departemen && k.nama_departemen.toLowerCase().includes(term)) ||
        (k.nama_level && k.nama_level.toLowerCase().includes(term)) ||
        (k.nama_jabatan && k.nama_jabatan.toLowerCase().includes(term));

      if (!matchSearch) return false;

      if (selectedDept && selectedDept.value !== "all") {
        if (k.nama_departemen !== selectedDept.value) return false;
      }

      if (selectedLevelTier && selectedLevelTier.value !== "all") {
        if (k.tier?.toString() !== selectedLevelTier.value) return false;
      }

      return true;
    });
  }, [rawData, searchQuery, selectedDept, selectedLevelTier]);

  // Grouped by departments for Department Matrix view
  const departmentGroups = useMemo(() => {
    const groups: Record<string, KaryawanNode[]> = {};
    filteredList.forEach((k) => {
      const dept = k.nama_departemen || "Tanpa Departemen";
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(k);
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredList]);

  // Grouped by Tiers for Tier Hierarchy view
  const tierGroups = useMemo(() => {
    const tiers = [1, 2, 3, 4, 5];
    return tiers.map((tierNum) => {
      const info = getTierInfo(tierNum);
      const members = filteredList.filter((k) => (k.tier || 5) === tierNum);
      return {
        tier: tierNum,
        info,
        members,
      };
    }).filter((g) => g.members.length > 0);
  }, [filteredList]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    (selectedDept !== null && selectedDept.value !== "all") ||
    (selectedLevelTier !== null && selectedLevelTier.value !== "all");

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDept(null);
    setSelectedLevelTier(null);
  };

  // Recursive Tree Node Renderer
  const renderTree = (nodes: KaryawanNode[]) => {
    if (!nodes || nodes.length === 0) return null;

    const matchSearch = (n: KaryawanNode, query: string): boolean => {
      if (!query) return true;
      const q = query.toLowerCase();
      if (n.nama_lengkap.toLowerCase().includes(q)) return true;
      if (n.nip?.toLowerCase().includes(q)) return true;
      if (n.nama_departemen?.toLowerCase().includes(q)) return true;
      if (n.nama_level?.toLowerCase().includes(q)) return true;
      if (n.children && n.children.some((c) => matchSearch(c, query))) return true;
      return false;
    };

    const visibleNodes = nodes.filter((n) => matchSearch(n, searchQuery));
    if (visibleNodes.length === 0) return null;

    const leafNodes = visibleNodes.filter(
      (n) => !n.children || n.children.length === 0
    );
    const nonLeafNodes = visibleNodes.filter(
      (n) => n.children && n.children.length > 0
    );

    const renderCard = (node: KaryawanNode) => {
      if (node.isDummy) {
        return (
          <div className="mx-auto w-[2px] bg-slate-300 h-16 md:h-20" />
        );
      }

      const isDirectMatch =
        Boolean(searchQuery) &&
        node.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase());
      const isFaded =
        selectedDept &&
        selectedDept.value !== "all" &&
        node.nama_departemen !== selectedDept.value;
      const isCollapsed = collapsedIds.has(node.id);
      const childCount = node.children?.length || 0;
      const tierInfo = getTierInfo(node.tier);
      const IconComp = tierInfo.icon;

      return (
        <div
          key={node.id}
          onClick={(e) => handleOpenDetail(node, e)}
          className={`org-card-clickable inline-block border-2 shadow-xs rounded-2xl p-4 bg-white transition-all duration-200 w-64 text-left select-none relative
            hover:-translate-y-1 hover:shadow-lg cursor-pointer
            ${isDirectMatch ? "ring-4 ring-amber-400/80 border-amber-500 bg-amber-50/70" : tierInfo.border}
            ${isFaded ? "opacity-35 grayscale" : "opacity-100"}
          `}
        >
          {/* Card Header Tag */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${tierInfo.badgeBg}`}
            >
              <IconComp size={10} />
              {tierInfo.label}
            </span>
            {childCount > 0 && (
              <span className="badge badge-xs font-mono tabular-nums font-bold bg-slate-100 text-slate-600">
                {childCount} Tim
              </span>
            )}
          </div>

          {/* Profile Row */}
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-2xs ${tierInfo.avatarBg}`}
            >
              {node.nama_lengkap.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-xs font-black text-slate-800 leading-snug truncate"
                title={node.nama_lengkap}
              >
                {node.nama_lengkap}
              </h3>
              {node.nip && (
                <p className="text-[10px] font-mono tabular-nums text-slate-400 mt-0.5">
                  NIP: {node.nip}
                </p>
              )}
              <div className="text-[11px] font-semibold text-[#0173b6] truncate mt-1">
                {node.nama_jabatan || node.nama_level || "Staff"}
              </div>
              {node.nama_departemen && (
                <p className="text-[10px] font-bold text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Building2 size={10} className="shrink-0 text-slate-400" />
                  {node.nama_departemen}
                </p>
              )}
            </div>
          </div>

          {/* Subordinate Expand / Collapse Toggle */}
          {childCount > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={(e) => toggleCollapse(node.id, e)}
                className={`btn btn-xs rounded-lg font-bold gap-1 transition-all ${
                  isCollapsed
                    ? "bg-blue-50 text-[#0173b6] hover:bg-blue-100 border-blue-200"
                    : "btn-ghost text-slate-500 hover:text-slate-800"
                }`}
                title={isCollapsed ? "Tampilkan bawahan" : "Sembunyikan bawahan"}
              >
                {isCollapsed ? (
                  <>
                    <ChevronRight size={12} />
                    <span>Buka {childCount} Cabang</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} />
                    <span>Ciutkan</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => handleOpenDetail(node, e)}
                className="text-[10px] text-slate-400 hover:text-[#0173b6] font-bold flex items-center gap-0.5"
              >
                <span>Info</span>
                <ArrowUpRight size={10} />
              </button>
            </div>
          )}
        </div>
      );
    };

    return (
      <ul>
        {nonLeafNodes.map((node) => {
          const isCollapsed = collapsedIds.has(node.id);
          return (
            <li key={node.id}>
              {renderCard(node)}
              {!isCollapsed &&
                node.children &&
                node.children.length > 0 &&
                renderTree(node.children)}
            </li>
          );
        })}

        {leafNodes.length > 0 && (
          <li>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 justify-center items-start place-items-center max-w-4xl mx-auto pt-2">
              {leafNodes.map((node) => renderCard(node))}
            </div>
          </li>
        )}
      </ul>
    );
  };

  // GSAP: Animasi entrance halaman & komponen utama
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".struktur-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".struktur-kpi-card",
          {
            y: 16,
            opacity: 0,
            duration: 0.35,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.25"
        )
        .from(
          ".struktur-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          ".struktur-content-wrap",
          {
            y: 16,
            opacity: 0,
            duration: 0.4,
            clearProps: "all",
          },
          "-=0.2"
        );
    },
    { scope: pageRef }
  );

  // GSAP: Animasi transisi halus saat tab mode visual berganti
  useGSAP(
    () => {
      gsap.from(".struktur-content-view", {
        y: 12,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "all",
      });

      if (viewMode === "levels") {
        gsap.from(".struktur-level-card", {
          y: 10,
          opacity: 0,
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "all",
        });
      } else if (viewMode === "departments") {
        gsap.from(".struktur-dept-card", {
          y: 10,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    { scope: pageRef, dependencies: [viewMode] }
  );

  return (
    <div ref={pageRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* Styles for Tree CSS Connectors */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .org-tree ul {
          padding-top: 24px; 
          position: relative;
          display: flex;
          justify-content: center;
        }
        .org-tree li {
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 24px 12px 0 12px;
        }
        .org-tree li::before, .org-tree li::after {
          content: '';
          position: absolute; top: 0; right: 50%;
          border-top: 2px solid #94a3b8;
          width: 50%; height: 24px;
        }
        .org-tree li::after {
          right: auto; left: 50%;
          border-left: 2px solid #94a3b8;
        }
        .org-tree li:only-child::after, .org-tree li:only-child::before {
          display: none;
        }
        .org-tree li:only-child { padding-top: 0; }
        .org-tree li:first-child::before, .org-tree li:last-child::after {
          border: 0 none;
        }
        .org-tree li:last-child::before {
          border-right: 2px solid #94a3b8;
          border-radius: 0 12px 0 0;
        }
        .org-tree li:first-child::after {
          border-radius: 12px 0 0 0;
        }
        .org-tree ul ul::before {
          content: '';
          position: absolute; top: 0; left: 50%;
          border-left: 2px solid #94a3b8;
          width: 0; height: 24px;
          transform: translateX(-50%);
        }
      `,
        }}
      />

      {/* 1. Header Section */}
      <div className="struktur-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <Network size={15} />
            <span>Tata Kelola SDM &amp; Garis Komando</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Struktur Organisasi
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Bagan hirarki resmi rumah sakit dari jajaran direksi, supervisor, kepala unit, hingga staf pelaksana RSU Avisena.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="join bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("tree")}
            className={`btn btn-sm join-item rounded-xl border-none font-bold text-xs gap-1.5 transition-all ${
              viewMode === "tree"
                ? "bg-white text-[#0173b6] shadow-xs"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Network size={14} />
            <span>Bagan Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("levels")}
            className={`btn btn-sm join-item rounded-xl border-none font-bold text-xs gap-1.5 transition-all ${
              viewMode === "levels"
                ? "bg-white text-[#0173b6] shadow-xs"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers size={14} />
            <span>Tingkatan Level</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("departments")}
            className={`btn btn-sm join-item rounded-xl border-none font-bold text-xs gap-1.5 transition-all ${
              viewMode === "departments"
                ? "bg-white text-[#0173b6] shadow-xs"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 size={14} />
            <span>Matriks Unit</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="struktur-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pegawai Aktif
            </p>
            <p className="text-2xl font-black text-slate-800 mt-0.5 font-mono tabular-nums">
              {stats.totalEmployees}
              <span className="text-xs font-semibold text-slate-500 ml-1.5">Personil</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Staf dalam bagan komando</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </div>

        <div className="struktur-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Jajaran Pimpinan (T1 - T4)
            </p>
            <p className="text-2xl font-black text-indigo-700 mt-0.5 font-mono tabular-nums">
              {stats.directorsCount + stats.supervisorsCount}
              <span className="text-xs font-semibold text-slate-500 ml-1.5">Pejabat</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Direksi &amp; Koordinator</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Crown size={20} />
          </div>
        </div>

        <div className="struktur-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Unit Kerja &amp; Instalasi
            </p>
            <p className="text-2xl font-black text-teal-700 mt-0.5 font-mono tabular-nums">
              {stats.totalDepts}
              <span className="text-xs font-semibold text-slate-500 ml-1.5">Departemen</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Divisi medis &amp; non-medis</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
        </div>

        <div className="struktur-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Span of Control Rata-rata
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5 font-mono tabular-nums">
              1 : {stats.spanOfControl}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Rasio pimpinan terhadap staf</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Briefcase size={20} />
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar Section */}
      <div className="struktur-filter bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Pencarian &amp; Filter Struktur
            </span>
            <span className="badge badge-sm font-mono tabular-nums font-bold bg-slate-100 text-slate-600">
              {filteredList.length} Pegawai
            </span>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "tree" && (
              <>
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="btn btn-xs btn-outline border-slate-200 hover:bg-slate-100 font-bold rounded-lg text-slate-700"
                >
                  Buka Semua Cabang
                </button>
                <button
                  type="button"
                  onClick={handleCollapseToManagers}
                  className="btn btn-xs btn-outline border-slate-200 hover:bg-slate-100 font-bold rounded-lg text-slate-700"
                >
                  Fokus Pimpinan
                </button>
              </>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0173b6] hover:text-[#05445e] transition-colors ml-2 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama pegawai, NIP, jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all h-[38px]"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Department Filter (SearchableSelect) */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={departmentOptions}
                value={selectedDept}
                onChange={(val) => setSelectedDept(val as FormOption | null)}
                placeholder="Semua Unit / Departemen"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>

          {/* Level Tier Filter (SearchableSelect) */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={levelTierOptions}
                value={selectedLevelTier}
                onChange={(val) => setSelectedLevelTier(val as FormOption | null)}
                placeholder="Semua Tingkatan Level"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* 4. Main Content Area */}
      <div className="struktur-content-wrap">
        {viewMode === "tree" ? (
          /* MODE 1: INTERACTIVE TREE CANVAS */
          <div
            ref={canvasRef}
            className="struktur-content-view h-[680px] bg-slate-50/70 rounded-3xl border-2 border-slate-200/90 shadow-inner overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
          {/* Floating Canvas Navigation Tools */}
          <div className="absolute top-5 right-5 z-20 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-3 hover:bg-slate-50 text-slate-700 border-b border-slate-100 transition-colors active:scale-95"
              title="Perbesar Bagan (Zoom In)"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-3 hover:bg-slate-50 text-slate-700 border-b border-slate-100 transition-colors active:scale-95"
              title="Perkecil Bagan (Zoom Out)"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="p-3 hover:bg-slate-50 text-slate-700 transition-colors active:scale-95"
              title="Pusatkan Tampilan (Reset View)"
            >
              <Maximize size={18} />
            </button>
          </div>

          {/* Canvas Scale Helper Badge */}
          <div className="absolute bottom-5 left-5 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-mono font-bold text-slate-600 flex items-center gap-2">
            <span>Perbesaran: {Math.round(scale * 100)}%</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-sans font-medium text-[11px]">
              Geser kanvas untuk navigasi
            </span>
          </div>

          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-white/80 backdrop-blur-2xs">
              <Loader2 className="animate-spin text-[#0173b6] mb-3" size={36} />
              <p className="text-slate-600 font-black text-xs tracking-widest uppercase">
                Menyusun Bagan Organisasi...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/95">
              <AlertTriangle size={48} className="text-rose-500 mb-3" />
              <h2 className="text-base font-bold text-slate-800">
                Gagal Memuat Bagan Organisasi
              </h2>
              <p className="text-xs text-rose-600 mt-1 max-w-md font-medium">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={fetchOrgChart}
                className="btn btn-sm bg-[#0173b6] hover:bg-[#05445e] text-white rounded-xl mt-4 font-bold gap-2"
              >
                <RotateCcw size={13} />
                Coba Muat Ulang
              </button>
            </div>
          ) : treeData.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Users size={48} className="text-slate-300 mb-3" />
              <h2 className="text-base font-bold text-slate-700">
                Data Bagan Tidak Tersedia
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada data pegawai yang memiliki relasi struktural aktif.
              </p>
            </div>
          ) : (
            <div
              className="w-full h-full"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "center 100px",
                transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="org-tree w-max min-w-full flex justify-center pt-8 pb-48">
                {renderTree(treeData)}
              </div>
            </div>
          )}
        </div>
        ) : viewMode === "levels" ? (
          /* MODE 2: HIERARCHY BY TIERS (ACCORDION DRILLDOWN) */
          <div className="struktur-content-view space-y-5">
            {tierGroups.map((group) => {
              const TierIcon = group.info.icon;
              return (
                <div
                  key={group.tier}
                  className="struktur-level-card bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
                >
                {/* Tier Category Header */}
                <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${group.info.badgeBg}`}
                    >
                      <TierIcon size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">
                        {group.info.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Tingkatan struktural Level {group.tier}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-sm font-mono tabular-nums font-bold bg-white text-slate-700 border border-slate-200">
                    {group.members.length} Pejabat / Staf
                  </span>
                </div>

                {/* Member Grid */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {group.members.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handleOpenDetail(person)}
                      className="p-3.5 bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/80 hover:border-[#0173b6]/60 rounded-xl transition-all cursor-pointer flex items-start gap-3 text-left group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${group.info.avatarBg}`}
                      >
                        {person.nama_lengkap.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#0173b6] truncate transition-colors">
                          {person.nama_lengkap}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                          NIP: {person.nip || "-"}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-600 mt-1 truncate">
                          {person.nama_jabatan || person.nama_level || "Staff"}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 size={10} className="shrink-0" />
                          <span className="truncate">{person.nama_departemen || "-"}</span>
                        </p>
                      </div>
                      <Eye size={14} className="text-slate-300 group-hover:text-[#0173b6] shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE 3: DEPARTMENT MATRIX VIEW */
        <div className="struktur-content-view grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentGroups.map(([deptName, members]) => {
            // Find head / manager in this department
            const sortedByTier = [...members].sort(
              (a, b) => (a.tier || 5) - (b.tier || 5)
            );
            const leader = sortedByTier[0];

            return (
              <div
                key={deptName}
                className="struktur-dept-card bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Dept Header */}
                  <div className="bg-[#05445e] text-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-200">
                        Departemen / Unit
                      </span>
                      <span className="badge badge-sm font-mono tabular-nums font-bold bg-white text-slate-900">
                        {members.length} Staf
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                      {deptName}
                    </h3>
                  </div>

                  {/* Leader Spotlight */}
                  {leader && (
                    <div className="p-3 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0173b6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {leader.nama_lengkap.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black uppercase text-blue-800">
                          Penanggung Jawab Unit
                        </span>
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {leader.nama_lengkap}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {leader.nama_jabatan || leader.nama_level || "Koordinator"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Member Roster (First 5) */}
                  <div className="p-3 divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleOpenDetail(m)}
                        className="py-2 px-1 flex items-center justify-between text-xs hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-800 truncate">
                            {m.nama_lengkap}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {m.nip ? `NIP: ${m.nip}` : m.nama_level || "Staff"}
                          </p>
                        </div>
                        <span
                          className={`badge badge-xs font-bold shrink-0 ${
                            (m.tier || 5) <= 3
                              ? "badge-primary"
                              : (m.tier || 5) === 4
                              ? "badge-info"
                              : "badge-ghost"
                          }`}
                        >
                          T{m.tier || 5}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
                  <span className="text-[10px] text-slate-400 font-bold">
                    RSU Avisena Human Capital
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* 5. Modal Profil & Detail Relasi Komando */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Posisi &amp; Relasi Komando"
        size="lg"
      >
        {activeEmployee && (
          <div className="space-y-4 p-1">
            {/* Header Banner */}
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0 ${
                  getTierInfo(activeEmployee.tier).avatarBg
                }`}
              >
                {activeEmployee.nama_lengkap.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 leading-snug truncate">
                    {activeEmployee.nama_lengkap}
                  </h3>
                  <span
                    className={`badge badge-sm font-bold text-[10px] ${
                      getTierInfo(activeEmployee.tier).badgeBg
                    }`}
                  >
                    Level {activeEmployee.tier}
                  </span>
                </div>
                <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                  NIP: {activeEmployee.nip || "-"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 mt-1">
                  <span>{activeEmployee.nama_jabatan || activeEmployee.nama_level || "Staff"}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#0173b6] font-bold">
                    {activeEmployee.nama_departemen || "Tanpa Departemen"}
                  </span>
                </div>
              </div>
            </div>

            {/* Atasan Langsung */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Crown size={12} className="text-[#0173b6]" />
                Atasan Langsung (Melapor Kepada)
              </span>
              {activeEmployeeRelations.atasan ? (
                <div
                  onClick={() => setActiveEmployee(activeEmployeeRelations.atasan)}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200 hover:border-[#0173b6] cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">
                      {activeEmployeeRelations.atasan.nama_lengkap}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {activeEmployeeRelations.atasan.nama_jabatan ||
                        activeEmployeeRelations.atasan.nama_level ||
                        "Pimpinan"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#0173b6] flex items-center gap-0.5">
                    Lihat Profil <ArrowUpRight size={10} />
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-1">
                  Merupakan pimpinan tertinggi (Direktur Eksekutif).
                </p>
              )}
            </div>

            {/* Daftar Bawahan Langsung */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users size={12} className="text-slate-500" />
                  Bawahan Langsung Terdaftar
                </span>
                <span className="badge badge-xs font-mono tabular-nums font-bold bg-white text-slate-700">
                  {activeEmployeeRelations.bawahan.length} Personil
                </span>
              </div>

              {activeEmployeeRelations.bawahan.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {activeEmployeeRelations.bawahan.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setActiveEmployee(b)}
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:border-[#0173b6] text-left cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {b.nama_lengkap}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {b.nama_jabatan || b.nama_level || "Staff"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-1">
                  Tidak memiliki bawahan langsung yang melapor.
                </p>
              )}
            </div>

            {/* Kontak Resmi */}
            {(activeEmployee.email || activeEmployee.handphone) && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeEmployee.handphone && (
                  <div className="flex items-center gap-2 text-slate-700 font-mono tabular-nums">
                    <Phone size={12} className="text-slate-400" />
                    <span>{activeEmployee.handphone}</span>
                  </div>
                )}
                {activeEmployee.email && (
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <Mail size={12} className="text-slate-400" />
                    <span className="truncate">{activeEmployee.email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-5"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
