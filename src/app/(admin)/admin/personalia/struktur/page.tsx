"use client";

import React, { useEffect, useState } from "react";
import { Network, Search, Loader2, User, Users } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/personalia/org-chart")
      .then((res) => res.json())
      .then((resData: KaryawanNode[]) => {
        // Build Tree
        const map = new Map<string, KaryawanNode>();
        resData.forEach((k) => map.set(k.id, { ...k, children: [] }));

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

          return (
            <li key={node.id}>
              <div 
                className={`inline-block border shadow-sm rounded-xl p-4 bg-white transition-all w-52
                  hover:-translate-y-1 hover:shadow-md hover:border-[#0173b6] cursor-pointer
                  ${isDirectMatch ? 'ring-2 ring-amber-400 bg-amber-50' : 'border-slate-200'}`}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Struktur Organisasi</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Bagan struktur hierarki perusahaan dari eksekutif hingga staff.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Cari karyawan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 pl-10 pr-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-inner overflow-auto relative p-8">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#0173b6] mb-4" size={32} />
            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Menyusun Bagan...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Users size={48} className="text-slate-300 mb-4" />
            <h2 className="text-lg font-bold text-slate-700">Tidak ada data</h2>
            <p className="text-slate-500 text-sm">Gagal menemukan relasi karyawan di database.</p>
          </div>
        ) : (
          <div className="org-tree w-max min-w-full flex justify-center transform origin-top transition-transform duration-300">
             {renderTree(data)}
          </div>
        )}
      </div>
    </div>
  );
}
