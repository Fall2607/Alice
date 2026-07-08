"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar as CalendarIcon, Clock, Sunrise, Sunset, Moon, Coffee } from "lucide-react";

interface ScheduleItem {
    date: string;
    dayOfWeek: number;
    shift: {
        id: number;
        nama_shift: string;
        jam_masuk: string;
        jam_keluar: string;
    } | null;
    shifts?: Array<{
        id: number;
        nama_shift: string;
        jam_masuk: string;
        jam_keluar: string;
    }>;
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [month, setMonth] = useState("");
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        
        const today = new Date();
        const localMonthStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().substring(0, 7);
        setMonth(localMonthStr);
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user?.karyawan_id || !month) return;
            setIsLoading(true);
            try {
                const res = await fetch(`/api/karyawan/${user.karyawan_id}/jadwal-bulanan?month=${month}`);
                if (res.ok) {
                    const data = await res.json();
                    setSchedule(data.schedule);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [user, month]);

    const getShiftTheme = (shiftName: string) => {
        const name = shiftName.toLowerCase();
        if (name.includes('libur') || name.includes('lepas') || name.includes('off')) return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', icon: Coffee };
        if (name.includes('malam')) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Moon };
        if (name.includes('siang')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Sunset };
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Sunrise };
    };

    const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    return (
        <div className="p-2 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Halo, {user?.name?.split(' ')[0] || 'Karyawan'}!</h1>
                    <p className="text-slate-500 font-medium mt-1">Ini adalah jadwal kerja Anda untuk bulan ini.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                    <CalendarIcon className="text-slate-400 ml-2" size={20} />
                    <input 
                        type="month" 
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-slate-700 font-bold cursor-pointer outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Desktop Calendar Header */}
                <div className="hidden sm:grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
                    {daysOfWeek.map((day, i) => (
                        <div key={day} className={`p-4 text-center text-xs font-black uppercase tracking-wider ${i >= 5 ? 'text-rose-500' : 'text-slate-500'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="font-medium animate-pulse">Menyiapkan kalender...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-7 sm:auto-rows-[minmax(120px,auto)]">
                        {/* Empty padding days for the first week to align dates correctly */}
                        {schedule.length > 0 && Array.from({ length: schedule[0].dayOfWeek === 0 ? 6 : schedule[0].dayOfWeek - 1 }).map((_, i) => (
                            <div key={`empty-${i}`} className="hidden sm:block border-b border-r border-slate-100 bg-slate-50/30 p-2"></div>
                        ))}
                        
                        {schedule.map((item, idx) => {
                            const dateObj = new Date(item.date);
                            const isToday = new Date().toISOString().split('T')[0] === item.date;
                            const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6;
                            const shiftsToRender = (item.shifts && item.shifts.length > 0) 
                                ? item.shifts 
                                : (item.shift ? [item.shift] : []);

                            return (
                                <div 
                                    key={item.date} 
                                    className={`
                                        relative p-3 border-b sm:border-r border-slate-100 transition-all hover:bg-slate-50 group
                                        ${isToday ? 'bg-blue-50/30' : ''}
                                    `}
                                >
                                    <div className="flex sm:flex-col justify-between items-start h-full gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`
                                                flex items-center justify-center w-8 h-8 rounded-full text-sm font-black
                                                ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 
                                                  isWeekend ? 'text-rose-500' : 'text-slate-700'}
                                            `}>
                                                {dateObj.getDate()}
                                            </span>
                                            {/* Mobile Day Name */}
                                            <span className="sm:hidden text-sm font-bold text-slate-500">
                                                {daysOfWeek[item.dayOfWeek === 0 ? 6 : item.dayOfWeek - 1]}
                                            </span>
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-end sm:justify-start gap-1">
                                            {shiftsToRender.length > 0 ? (
                                                shiftsToRender.map((shiftInfo, sIdx) => {
                                                    const theme = getShiftTheme(shiftInfo.nama_shift);
                                                    const Icon = theme.icon;
                                                    
                                                    if (shiftInfo.nama_shift.toLowerCase().includes('libur')) {
                                                        return (
                                                            <div key={sIdx} className={`w-full max-w-[160px] sm:max-w-none flex flex-col gap-1 p-2 rounded-xl border ${theme.bg} ${theme.border}`}>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Coffee size={12} className="text-slate-500" />
                                                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">LIBUR / OFF</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div key={sIdx} className={`w-full max-w-[160px] sm:max-w-none flex flex-col gap-1 p-2 rounded-xl border ${theme.bg} ${theme.border}`}>
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon size={12} className={theme.text} />
                                                                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wide truncate ${theme.text}`}>
                                                                    {shiftInfo.nama_shift}
                                                                </span>
                                                            </div>
                                                            {(shiftInfo.jam_masuk && shiftInfo.jam_keluar) && (
                                                                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-500 opacity-80 mt-0.5">
                                                                    <Clock size={10} />
                                                                    {shiftInfo.jam_masuk.slice(0,5)} - {shiftInfo.jam_keluar.slice(0,5)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full max-w-[160px] sm:max-w-none flex flex-col gap-1 p-2 rounded-xl border bg-slate-50 border-slate-200">
                                                    <div className="flex items-center gap-1.5">
                                                        <Coffee size={12} className="text-slate-500" />
                                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">LIBUR / OFF</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
