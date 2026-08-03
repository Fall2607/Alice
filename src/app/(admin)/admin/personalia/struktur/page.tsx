"use client";

import React, { useEffect, useState, useRef, MouseEvent } from "react";
import { Network, Search, Loader2, User, Users, ZoomIn, ZoomOut, Maximize, ChevronDown } from "lucide-react";

interface KaryawanNode {
  id: string;
  nama_lengkap: string;
  atasan_id: string | null;
  nama_departemen: string | null;
  nama_level: string | null;
  jenis_kelamin?: string;
  children?: KaryawanNode[];
}

export default function StrukturOrganisasiPage() {
  const [data, setData] = useState<KaryawanNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter State
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("All");

  // Canvas State for Pan & Zoom
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/personalia/org-chart")
      .then((res) => res.json())
      .then((resData: any) => {
        if (!Array.isArray(resData)) {
          console.error("Invalid API Response:", resData);
          setData([]);
          return;
        }

        // Extract unique departments for filter
        const depts = new Set<string>();
        resData.forEach(k => {
          if (k.nama_departemen) depts.add(k.nama_departemen);
        });
        setDepartments(Array.from(depts).sort());

        // Build Tree
        const map = new Map<string, KaryawanNode>();
        resData.forEach((k: KaryawanNode) => map.set(k.id, { ...k, children: [] }));

        const roots: KaryawanNode[] = [];
        map.forEach((node) => {
          if (node.atasan_id && map.has(node.atasan_id)) {
            map.get(node.atasan_id)!.children!.push(node);
          } else {
            roots.push(node);
          }
        });
        
        setData(roots);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Drag handlers
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));
  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Recursive component to render nodes
  const renderTree = (nodes: KaryawanNode[]) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ul>
        {nodes.map((node) => {
          // Check if node or its children match search query
          const matchSearch = (n: KaryawanNode, query: string): boolean => {
            if (!query) return true;
            if (n.nama_lengkap.toLowerCase().includes(query.toLowerCase())) return true;
            if (n.nama_departemen?.toLowerCase().includes(query.toLowerCase())) return true;
            if (n.children && n.children.some(c => matchSearch(c, query))) return true;
            return false;
          };

          const isMatch = matchSearch(node, searchQuery);
          if (searchQuery && !isMatch) return null;

          const isDirectMatch = searchQuery && node.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Department Filter Logic (Highlight & Fade)
          const isFaded = selectedDept !== "All" && node.nama_departemen !== selectedDept;

          return (
            <li key={node.id}>
              <div 
                className={`inline-block border shadow-sm rounded-xl p-4 bg-white transition-all duration-300 w-52
                  hover:-translate-y-1 hover:shadow-md hover:border-[#0173b6] cursor-pointer
                  ${isDirectMatch ? 'ring-2 ring-amber-400 bg-amber-50' : 'border-slate-200'}
                  ${isFaded ? 'opacity-40 grayscale' : 'opacity-100'}
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0
                    ${node.nama_level?.toLowerCase().includes('direktur') ? 'bg-indigo-600' : 
                      node.nama_level?.toLowerCase().includes('koordinator') || node.nama_level?.toLowerCase().includes('spv') || node.nama_level?.toLowerCase().includes('supervisor') ? 'bg-blue-500' : 'bg-slate-400'}`}>
                    {node.jenis_kelamin === 'Perempuan' ? <User size={24} /> : <User size={24} />}
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight min-h-[40px] flex items-center justify-center">{node.nama_lengkap}</h3>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#0173b6] mt-1.5 bg-blue-50 py-1 rounded-md px-2 truncate">
                      {node.nama_level || 'Staff'}
                    </div>
                    {node.nama_departemen && (
                      <p className="text-xs font-semibold text-slate-500 mt-1.5 truncate">
                        {node.nama_departemen}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {node.children && node.children.length > 0 && renderTree(node.children)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Styles for tree CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .org-tree ul {
          padding-top: 20px; 
          position: relative;
          display: flex;
          justify-content: center;
        }
        .org-tree li {
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 10px 0 10px;
        }
        .org-tree li::before, .org-tree li::after{
          content: '';
          position: absolute; top: 0; right: 50%;
          border-top: 2px solid #cbd5e1;
          width: 50%; height: 20px;
        }
        .org-tree li::after{
          right: auto; left: 50%;
          border-left: 2px solid #cbd5e1;
        }
        .org-tree li:only-child::after, .org-tree li:only-child::before {
          display: none;
        }
        .org-tree li:only-child{ padding-top: 0;}
        .org-tree li:first-child::before, .org-tree li:last-child::after{
          border: 0 none;
        }
        .org-tree li:last-child::before{
          border-right: 2px solid #cbd5e1;
          border-radius: 0 10px 0 0;
        }
        .org-tree li:first-child::after{
          border-radius: 10px 0 0 0;
        }
        .org-tree ul ul::before{
          content: '';
          position: absolute; top: 0; left: 50%;
          border-left: 2px solid #cbd5e1;
          width: 0; height: 20px;
          transform: translateX(-50%);
        }
      `}} />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Struktur Organisasi</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Bagan struktur hierarki perusahaan dari eksekutif hingga staff.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Department Filter */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all cursor-pointer min-w-[160px]"
            >
              <option value="All">Semua Unit</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Cari karyawan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-10 pr-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* Main Chart Area (Interactive Canvas) */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#f8fafc] rounded-2xl border border-slate-200 shadow-inner overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 z-10 flex flex-col bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <button onClick={handleZoomIn} className="p-2.5 hover:bg-slate-50 text-slate-600 border-b border-slate-100 transition-colors" title="Zoom In">
            <ZoomIn size={20} />
          </button>
          <button onClick={handleZoomOut} className="p-2.5 hover:bg-slate-50 text-slate-600 border-b border-slate-100 transition-colors" title="Zoom Out">
            <ZoomOut size={20} />
          </button>
          <button onClick={handleZoomReset} className="p-2.5 hover:bg-slate-50 text-slate-600 transition-colors" title="Reset View">
            <Maximize size={20} />
          </button>
        </div>

        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Loader2 className="animate-spin text-[#0173b6] mb-4" size={32} />
            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Menyusun Bagan...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <Users size={48} className="text-slate-300 mb-4" />
            <h2 className="text-lg font-bold text-slate-700">Tidak ada data</h2>
            <p className="text-slate-500 text-sm">Gagal menemukan relasi karyawan di database.</p>
          </div>
        ) : (
          <div 
            className="w-full h-full"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center top',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <div className="org-tree w-max min-w-full flex justify-center pt-12 pb-32">
               {renderTree(data)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
