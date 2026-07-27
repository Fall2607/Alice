const fs = require('fs');

const path = 'src/app/(admin)/admin/my-activity/components/CutiTab.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{\/\* MODAL RESCHEDULE \*\/\}.*?\{\/\* Sisi Kiri: Main Content \*\/\}/s;

const rescheduleModalStr = `
      {/* MODAL RESCHEDULE */}
      {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <button onClick={() => setIsRescheduleModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 z-10"><XCircle size={28} /></button>
                  
                  <div className="mb-6">
                      <h2 className="text-2xl font-black text-slate-800">Ganti Tanggal Cuti</h2>
                      <p className="text-slate-500 font-bold mt-1">Silakan pilih tanggal pengganti di kalender periodik ini.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">Kalender Periodik</label>
                        <input 
                            type="month" 
                            value={selectedPeriod} 
                            onChange={e => { setSelectedPeriod(e.target.value); setSelectedDates([]); }} 
                            className="bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:border-blue-500 transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1.5">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-slate-400 py-1">{day}</div>
                        ))}
                        {[...Array(getPeriodDates().length > 0 ? getPeriodDates()[0].getDay() : 0).fill(null), ...getPeriodDates()].map((date, idx) => {
                            if (!date) return <div key={\`empty-\${idx}\`} className="p-2"></div>;
                            const isSelected = selectedDates.find(d => d.getTime() === date.getTime());
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            
                            const toggleDate = (d) => {
                                const exist = selectedDates.find(sd => sd.getTime() === d.getTime());
                                if(exist) setSelectedDates(selectedDates.filter(sd => sd.getTime() !== d.getTime()));
                                else setSelectedDates([...selectedDates, d].sort((a,b) => a.getTime() - b.getTime()));
                            };

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleDate(date)}
                                    className={\`p-1.5 rounded-xl font-bold flex flex-col items-center justify-center transition-all aspect-square 
                                        \${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-600 ring-offset-2 scale-105' : 
                                          'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                                        } \${isToday && !isSelected ? 'text-blue-600 ring-1 ring-blue-300' : ''} \${isWeekend && !isSelected ? 'text-rose-500 bg-rose-50/20' : ''}\`}
                                >
                                    <span className="text-sm">{date.getDate()}</span>
                                </button>
                            )
                        })}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
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
                    disabled={selectedDates.length === 0}
                    className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    Simpan Perubahan
                  </button>
              </div>
          </div>
      )}

      {/* Sisi Kiri: Main Content */}
`;

if (content.match(regex)) {
    content = content.replace(regex, rescheduleModalStr);
} else {
    // If it doesn't match for some reason, we can just replace the old modal manually
    const startIdx = content.indexOf('{/* MODAL RESCHEDULE */}');
    const endIdx = content.indexOf('{/* Sisi Kiri: Main Content */}');
    if(startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + rescheduleModalStr + content.substring(endIdx + '{/* Sisi Kiri: Main Content */}'.length);
    }
}

fs.writeFileSync(path, content);
console.log('Fixed Modal in CutiTab.tsx');
