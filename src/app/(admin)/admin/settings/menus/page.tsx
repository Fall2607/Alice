/** Path: app/(admin)/admin/settings/menus/page.tsx */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  ChevronRight, 
  Settings2,
  Search,
  ExternalLink,
  ChevronDown,
  X,
  Save,
  Grid
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// --- INTERNAL MODAL ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm"><X size={20} /></button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

interface Menu {
  id: string;
  parent_id: string | null;
  nama_menu: string;
  path: string;
  icon: string;
  urutan: number;
  is_active: boolean;
  parent_name?: string;
}

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nama_menu: "",
    path: "",
    icon: "Circle",
    parent_id: "",
    urutan: 0
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/menus`);
      const data = await res.json();
      setMenus(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMenus(); }, [baseUrl]);

  const parentMenus = useMemo(() => menus.filter(m => !m.parent_id), [menus]);

  const filteredMenus = useMemo(() => {
    return menus.filter(m => 
      m.nama_menu.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menus, searchTerm]);

  const handleOpenAdd = () => {
    setSelectedMenu(null);
    setFormData({ nama_menu: "", path: "", icon: "Circle", parent_id: "", urutan: menus.length + 1 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setFormData({
      nama_menu: menu.nama_menu,
      path: menu.path,
      icon: menu.icon,
      parent_id: menu.parent_id || "",
      urutan: menu.urutan
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = selectedMenu ? "PATCH" : "POST";
    const url = selectedMenu ? `${baseUrl}/menus/${selectedMenu.id}` : `${baseUrl}/menus`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchMenus();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!selectedMenu) return;
    try {
      const res = await fetch(`${baseUrl}/menus/${selectedMenu.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) alert(data.message);
      else {
        setIsDeleteModalOpen(false);
        fetchMenus();
      }
    } catch (e) { console.error(e); }
  };

  const DynamicIcon = ({ name }: { name: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.Circle;
    return <Icon size={18} />;
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Konfigurasi Navigasi</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Atur struktur menu & sub-menu aplikasi</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white font-black py-4 px-8 rounded-3xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          <PlusCircle size={20} /> Tambah Menu Baru
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Cari nama menu atau path..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[24px] shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-600"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama & Icon</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Path URL</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kategori (Parent)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Urutan</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={40} /></td></tr>
              ) : filteredMenus.map((menu) => (
                <tr key={menu.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <DynamicIcon name={menu.icon} />
                      </div>
                      <span className={`font-black tracking-tight ${menu.parent_id ? "text-slate-500 text-sm ml-4" : "text-slate-800 text-base"}`}>
                        {menu.parent_id && <ChevronRight size={14} className="inline mr-2 text-slate-300" />}
                        {menu.nama_menu}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <code className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[11px] font-bold">{menu.path}</code>
                  </td>
                  <td className="px-8 py-5">
                    {menu.parent_name ? (
                      <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">{menu.parent_name}</span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">— Root —</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xs">{menu.urutan}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEdit(menu)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white"><Edit3 size={18} /></button>
                      <button onClick={() => { setSelectedMenu(menu); setIsDeleteModalOpen(true); }} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm bg-white"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedMenu ? "Perbarui Detail Menu" : "Daftarkan Menu Baru"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Menu</label>
              <input type="text" value={formData.nama_menu} onChange={(e) => setFormData({...formData, nama_menu: e.target.value})} required className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700" placeholder="Contoh: Dashboard" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ikon (Lucide)</label>
              <input type="text" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700" placeholder="Contoh: Users" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Path URL / Href</label>
            <input type="text" value={formData.path} onChange={(e) => setFormData({...formData, path: e.target.value})} required className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700" placeholder="/admin/pegawai atau #" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kategori Utama</label>
              <select value={formData.parent_id} onChange={(e) => setFormData({...formData, parent_id: e.target.value})} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-white outline-none font-bold text-slate-700">
                <option value="">— Menu Utama —</option>
                {parentMenus.filter(p => p.id !== selectedMenu?.id).map(p => (
                  <option key={p.id} value={p.id}>{p.nama_menu}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Urutan Tampil</label>
              <input type="number" value={formData.urutan} onChange={(e) => setFormData({...formData, urutan: parseInt(e.target.value)})} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Batal</button>
             <button type="submit" className="flex-1 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
               <Save size={18} /> {selectedMenu ? "Simpan Perubahan" : "Tambahkan Menu"}
             </button>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRMATION --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Menu">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-100 shadow-sm shadow-red-100">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Konfirmasi Penghapusan</h3>
          <p className="text-slate-400 text-sm font-medium leading-relaxed px-4">Apakah Anda yakin ingin menghapus menu <span className="text-slate-900 font-bold">{selectedMenu?.nama_menu}</span>? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="pt-6 flex gap-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Batal</button>
            <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-200 transition-all text-xs uppercase tracking-widest">Ya, Hapus Permanen</button>
          </div>
        </div>
      </Modal>

      <p className="mt-12 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.6em]">
        Alice • Menu Control System • {new Date().getFullYear()}
      </p>
    </div>
  );
}