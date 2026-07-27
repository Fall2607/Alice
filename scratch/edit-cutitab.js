const fs = require('fs');

const path = 'src/app/(admin)/admin/my-activity/components/CutiTab.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add sweetalert2 import
if (!content.includes('import Swal')) {
    content = content.replace('import Select from "react-select";', 'import Select from "react-select";\nimport Swal from "sweetalert2";\nimport { XCircle, Edit } from "lucide-react";');
}

// Add state for reschedule
if (!content.includes('isRescheduleModalOpen')) {
    content = content.replace('const [selectedPeriod, setSelectedPeriod] = useState', 
        'const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);\n  const [rescheduleData, setRescheduleData] = useState<any>(null);\n  const [selectedPeriod, setSelectedPeriod] = useState');
}

// Map tanggal_mulai
content = content.replace(
    'range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {day:\'numeric\', month:\'short\'})} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {day:\'numeric\', month:\'short\'})}`,',
    'range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {day:\'numeric\', month:\'short\'})} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {day:\'numeric\', month:\'short\'})}`,\n              tanggal_mulai: c.tanggal_mulai,\n              tanggal_selesai: c.tanggal_selesai,'
);

// Helper methods for cancel & reschedule
const logicMethods = `
  const checkHMin1 = (tanggal_mulai: string) => {
      const tm = new Date(tanggal_mulai);
      tm.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      return today < tm;
  };

  const handleCancelCuti = async (cuti: any) => {
      if(!checkHMin1(cuti.tanggal_mulai)){
          Swal.fire('Gagal', 'Pembatalan hanya bisa dilakukan maksimal H-1', 'error');
          return;
      }
      
      const res = await Swal.fire({
          title: 'Batalkan Cuti?',
          text: "Jadwal Anda akan dikembalikan seperti semula.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Ya, Batalkan!'
      });

      if (!res.isConfirmed) return;
      
      try {
          const userStr = localStorage.getItem("user");
          const user = JSON.parse(userStr!);
          const response = await fetch('/api/cuti/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cuti_id: cuti.id, karyawan_id: user.karyawan_id })
          });
          if(response.ok){
              Swal.fire('Berhasil!', 'Cuti berhasil dibatalkan', 'success').then(() => window.location.reload());
          } else {
              const err = await response.json();
              Swal.fire('Gagal', err.message, 'error');
          }
      } catch(e) { console.error(e); }
  }

  const openRescheduleModal = (cuti: any) => {
      if(!checkHMin1(cuti.tanggal_mulai)){
          Swal.fire('Gagal', 'Ganti tanggal hanya bisa dilakukan maksimal H-1', 'error');
          return;
      }
      setRescheduleData(cuti);
      setIsRescheduleModalOpen(true);
      // Reset selected dates so they can pick again
      setSelectedDates([]);
      setLeaveForm({ ...leaveForm, alasan: cuti.alasan });
  }

  const handleRescheduleSubmit = async () => {
      if (selectedDates.length === 0) {
          Swal.fire('Error', 'Pilih tanggal cuti yang baru di kalender', 'error');
          return;
      }
      try {
          const userStr = localStorage.getItem("user");
          const user = JSON.parse(userStr!);
          
          const formatDates = selectedDates.map(d => {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              return \`\${yyyy}-\${mm}-\${dd}\`;
          });
          // Match the dates format
          const newAlasan = \`\${leaveForm.alasan.replace(/\\[DATES:.*\\]/, '').trim()} [DATES: \${formatDates.join(', ')}]\`;

          const res = await fetch('/api/cuti/reschedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  cuti_id: rescheduleData.id,
                  karyawan_id: user.karyawan_id,
                  tanggal_mulai: formatDates[0],
                  tanggal_selesai: formatDates[formatDates.length - 1],
                  jumlah_hari: selectedDates.length,
                  alasan: newAlasan
              })
          });

          if (res.ok) {
              Swal.fire('Berhasil', 'Jadwal cuti berhasil diganti', 'success').then(() => window.location.reload());
          } else {
              const err = await res.json();
              Swal.fire('Gagal', err.message, 'error');
          }
      } catch (e) {
          console.error(e);
      }
  }
`;

if (!content.includes('handleCancelCuti')) {
    content = content.replace('const handleCutiSubmit = async (e: React.FormEvent) => {', logicMethods + '\n  const handleCutiSubmit = async (e: React.FormEvent) => {');
}

// Update Render Item
const buttonGroup = `
                  <div className="mt-3 flex gap-2 pt-3 border-t border-slate-100">
                    <button 
                        onClick={() => openRescheduleModal(item)}
                        disabled={item.status === 'Ditolak' || item.status === 'Dibatalkan' || !checkHMin1(item.tanggal_mulai)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-[10px] hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Edit size={12}/> Ganti Jadwal
                    </button>
                    <button 
                        onClick={() => handleCancelCuti(item)}
                        disabled={item.status === 'Ditolak' || item.status === 'Dibatalkan' || !checkHMin1(item.tanggal_mulai)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-[10px] hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <XCircle size={12}/> Batalkan
                    </button>
                  </div>
`;

if (!content.includes('Ganti Jadwal')) {
    content = content.replace('"{item.alasan}"\n                  </p>\n                </div>', '"{item.alasan}"\n                  </p>\n' + buttonGroup + '\n                </div>');
}

// Add Reschedule Modal at the end
const rescheduleModalStr = `
      {/* MODAL RESCHEDULE */}
      {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row gap-8">
                  <button onClick={() => setIsRescheduleModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 z-10"><XCircle size={28} /></button>
                  
                  <div className="flex-1">
                      <div className="mb-6">
                          <h2 className="text-2xl font-black text-slate-800">Ganti Tanggal Cuti</h2>
                          <p className="text-slate-500 font-bold mt-1">Silakan pilih tanggal pengganti di kalender.</p>
                      </div>

                      <div className="mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={handlePrevMonth} className="p-2 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-600"><ChevronLeft size={16} /></button>
                            <span className="font-bold text-slate-700 text-sm">{monthName}</span>
                            <button onClick={handleNextMonth} className="p-2 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-600"><ChevronRight size={16} /></button>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1">
                            {weekDays.map(day => <div key={day} className="text-center text-[10px] font-black uppercase text-slate-400 pb-2">{day}</div>)}
                            {Array.from({ length: firstDay }).map((_, i) => <div key={'empty-'+i} className="p-2"></div>)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = selectedDates.some(d => d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear());
                                return (
                                    <div 
                                        key={day} 
                                        onClick={() => handleDateClick(day)}
                                        className={\`h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all \${
                                            isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'bg-slate-50 text-slate-700 hover:bg-blue-100 hover:text-blue-600'
                                        }\`}
                                    >
                                        {day}
                                    </div>
                                );
                            })}
                          </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700">Alasan</label>
                        <textarea
                          rows={3}
                          value={leaveForm.alasan}
                          onChange={(e) => setLeaveForm({...leaveForm, alasan: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        ></textarea>
                      </div>

                      <button 
                        onClick={handleRescheduleSubmit}
                        className="w-full mt-6 bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs"
                      >
                        Simpan Perubahan
                      </button>
                  </div>
              </div>
          </div>
      )}
`;

if(!content.includes('MODAL RESCHEDULE')) {
    // Inject at the very end before last </div>
    const lastDivIndex = content.lastIndexOf('</div>');
    content = content.substring(0, lastDivIndex) + rescheduleModalStr + content.substring(lastDivIndex);
}

// Add Chevron imports
if(!content.includes('ChevronLeft')) {
    content = content.replace('Calendar,', 'Calendar,\n  ChevronLeft,\n  ChevronRight,');
}

fs.writeFileSync(path, content);
console.log('CutiTab.tsx updated successfully');
