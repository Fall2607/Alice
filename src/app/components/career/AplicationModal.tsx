"use client";

import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Map,
  Heart,
  Users,
  Baby,
  Briefcase,
  ChevronRight,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  formData: any;
  handleInputChange: (e: any) => void;
  handleCustomChange: (name: string, val: string) => void;
  handleSubmitStep1: (e: any) => void;
  religionOptions: any[];
  maritalStatusOptions: any[];
  SearchableSelect: any;
  DateInput: any;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  job,
  formData,
  handleInputChange,
  handleCustomChange,
  handleSubmitStep1,
  religionOptions,
  maritalStatusOptions,
  SearchableSelect,
  DateInput,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* MODAL WRAPPER */}
      <div className="bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-4xl rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col transition-transform transform translate-y-0">

        {/* MOBILE DRAG HANDLE */}
        <div className="md:hidden flex justify-center pt-3 pb-1 bg-white" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        {/* HEADER */}
        <div className="px-6 md:px-8 py-4 md:py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Formulir Lamaran</h2>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">
              Posisi:{" "}
              <span className="text-primary font-semibold truncate max-w-[200px] inline-block">
                {job?.title}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="px-6 md:px-8 py-3 md:py-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs md:text-sm shadow-lg shadow-primary/20">
              1
            </div>
            <span className="text-xs md:text-sm">Identitas</span>

            <div className="h-1 w-8 md:w-12 bg-slate-200 rounded-full ml-2 md:ml-4"></div>

            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs md:text-sm ml-2">
              2
            </div>
            <span className="text-slate-400 font-normal text-xs md:text-sm hidden sm:inline">
              Dokumen & CV
            </span>
            <span className="text-slate-400 font-normal text-xs md:text-sm sm:hidden">
              Dokumen
            </span>
          </div>
        </div>

        {/* BODY (FORM) */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
          <form id="identityForm" onSubmit={handleSubmitStep1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* A. IDENTITAS DIRI */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <User size={16} className="text-primary" /> A. Identitas Diri
                </h3>
              </div>

              {/* NAMA */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Lengkap Beserta Gelar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Contoh: dr. Ahmad Fauzi, Sp.PD"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@anda.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* WHATSAPP */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  No. HP (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="08123xxxxxxx"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* TEMPAT LAHIR */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tem
                  pat Lahir <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="birthPlace"
                    required
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    placeholder="Kota Kelahiran"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* TANGGAL LAHIR */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <DateInput
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleCustomChange}
                  icon={Calendar}
                />
              </div>

              {/* SUKU */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Suku Bangsa</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleInputChange}
                    placeholder="Contoh: Sunda, Jawa"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* AGAMA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Agama <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={religionOptions}
                  value={formData.religion}
                  onChange={(v: string) => handleCustomChange("religion", v)}
                  placeholder="Pilih Agama"
                  icon={Heart}
                />
              </div>

              {/* KTP */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  No. KTP (NIK) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="ktp"
                    required
                    value={formData.ktp}
                    onChange={handleInputChange}
                    placeholder="16 digit NIK"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* ALAMAT */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Alamat Lengkap Sekarang <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Map className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <textarea
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 resize-none text-sm md:text-base"
                  ></textarea>
                </div>
              </div>

              {/* STATUS PERKAWINAN */}
              <div className="md:col-span-2 pt-2 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Status Perkawinan <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={maritalStatusOptions}
                  value={formData.maritalStatus}
                  onChange={(v: string) => handleCustomChange("maritalStatus", v)}
                  placeholder="Pilih Status Perkawinan"
                  icon={Users}
                />
              </div>

              {/* FORM PASANGAN */}
              {formData.maritalStatus === "Kawin" && (
                <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 animate-in slide-in-from-top-4 fade-in duration-300">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Heart size={16} /> Data Pasangan
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* NAMA PASANGAN */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Nama Suami / Istri
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                          type="text"
                          name="spouseName"
                          required
                          value={formData.spouseName}
                          onChange={handleInputChange}
                          placeholder="Nama Lengkap Pasangan"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base bg-white"
                        />
                      </div>
                    </div>

                    {/* TEMPAT LAHIR */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Tempat Lahir Pasangan
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                          type="text"
                          name="spouseBirthPlace"
                          required
                          value={formData.spouseBirthPlace}
                          onChange={handleInputChange}
                          placeholder="Kota Kelahiran"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    {/* TANGGAL LAHIR PASANGAN */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Tanggal Lahir Pasangan
                      </label>
                      <DateInput
                        name="spouseBirthDate"
                        value={formData.spouseBirthDate || ""}
                        onChange={handleCustomChange}
                        icon={Calendar}
                      />
                    </div>

                    {/* JUMLAH ANAK */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Jumlah Anak
                      </label>
                      <div className="relative">
                        <Baby className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                          type="number"
                          name="childrenCount"
                          min="0"
                          value={formData.childrenCount}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    {/* NOMOR HP PASANGAN */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        No. HP Pasangan
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                          type="tel"
                          name="spousePhone"
                          required
                          value={formData.spousePhone}
                          onChange={handleInputChange}
                          placeholder="08xxxxxxxxxx"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* B. DATA ORANG TUA */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Users size={16} className="text-primary" /> B. Data Keluarga (Orang Tua)
                </h3>
              </div>

              {/* AYAH */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Ayah
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="fatherName"
                    required
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="Nama Lengkap Ayah"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* PEKERJAAN AYAH */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Pekerjaan Ayah
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="fatherJob"
                    required
                    value={formData.fatherJob}
                    onChange={handleInputChange}
                    placeholder="Pekerjaan"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* HP AYAH */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  No. HP Ayah
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="tel"
                    name="fatherPhone"
                    required
                    value={formData.fatherPhone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* IBU */}
              <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Ibu
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="motherName"
                    required
                    value={formData.motherName}
                    onChange={handleInputChange}
                    placeholder="Nama Lengkap Ibu"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* PEKERJAAN IBU */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Pekerjaan Ibu
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="motherJob"
                    required
                    value={formData.motherJob}
                    onChange={handleInputChange}
                    placeholder="Pekerjaan"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* HP IBU */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  No. HP Ibu
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="tel"
                    name="motherPhone"
                    required
                    value={formData.motherPhone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 md:gap-4 shrink-0 safe-area-bottom">
          <button
            onClick={onClose}
            className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm md:text-base"
          >
            Batal
          </button>

          <button
            type="submit"
            form="identityForm"
            className="px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 text-sm md:text-base"
          >
            Lanjut <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
