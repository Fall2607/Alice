// File: src/app/karir/[slug]/apply/ApplyContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// --- TYPES ---
export type Sibling = {
  id: string;
  name: string;
  gender: string;
  age: string;
  relation: string;
  job: string;
};

export type EducationItem = {
  id: string;
  level?: string; // SD, SMP, SMA, SMK, D3, S1, S2, S3
  school: string;
  major?: string; // Jurusan (IPA, IPS, Teknik Informatika, dll)
  yearFrom: string;
  yearTo: string;
  certificateNo: string;
  ipk?: string; // Optional IPK
};

export type ExperienceItem = {
  id: string;
  company: string;
  position: string;
  place: string;
  duration: string;
  fromYear: string;
  toYear: string;
  reasonLeave: string;
};

// Tipe Dokumen Utama
export type Documents = Record<
  "cv" | "photo" | "ktp" | "ijazah" | "kk" | "str" | "transkrip" | "paklaring",
  File | null
>;

// NEW: Tipe Dokumen Tambahan (Dinamis)
export type OtherDocumentItem = {
    id: string;
    name: string; 
    file: File | null;
};

type ApplyState = {
  identity: Record<string, any>;
  siblings: Sibling[];
  educationFormal: EducationItem[];
  educationNonFormal: EducationItem[];
  experiences: ExperienceItem[];
  documents: Documents;
  otherDocuments: OtherDocumentItem[]; // Menambahkan state ini
  assessmentAnswers: Record<string, any>; // NEW: State untuk Assessment
  existingDocs?: Record<string, boolean>; // NEW: To track already uploaded docs via OTP
};

type ApplyContextType = {
  state: ApplyState;
  setIdentityField: (name: string, value: any) => void;
  
  // Siblings
  addSibling: () => void;
  updateSibling: (id: string, data: Partial<Sibling>) => void;
  removeSibling: (id: string) => void;
  
  // Education
  addEducationFormal: () => void;
  updateEducationFormal: (id: string, data: Partial<EducationItem>) => void;
  removeEducationFormal: (id: string) => void;
  addEducationNonFormal: () => void;
  updateEducationNonFormal: (id: string, data: Partial<EducationItem>) => void;
  removeEducationNonFormal: (id: string) => void;
  
  // Experience
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  
  // Documents
  setDocumentFile: (key: keyof Documents, file: File | null) => void;
  
  // NEW: Other Documents Actions
  addOtherDocument: () => void;
  updateOtherDocument: (id: string, data: Partial<OtherDocumentItem>) => void;
  removeOtherDocument: (id: string) => void;

  // NEW: Assessment Action
  setAssessmentAnswer: (questionId: string, value: any) => void;

  bulkSetData: (data: Partial<ApplyState>) => void;

  resetAll: () => void;
};

const defaultDocuments: Documents = {
  cv: null, photo: null, ktp: null, ijazah: null, kk: null, str: null, transkrip: null, paklaring: null
};

const makeId = (p = "") => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${p}`;

const initialState: ApplyState = {
  identity: {
    fullName: "", email: "", whatsapp: "", birthPlace: "", birthDate: "", ethnicity: "", religion: "", ktp: "", address: "", maritalStatus: "",
    spouseName: "", spouseBirthPlace: "", spouseBirthDate: "", childrenCount: "", spousePhone: "",
    fatherName: "", fatherJob: "", fatherPhone: "", motherName: "", motherJob: "", motherPhone: "",
  },
  siblings: [],
  educationFormal: [],
  educationNonFormal: [],
  experiences: [],
  documents: defaultDocuments,
  otherDocuments: [], // Inisialisasi array kosong agar tidak undefined
  assessmentAnswers: {}, // NEW: Inisialisasi awal empty object
};

const STORAGE_KEY = "apply_form_v2";

const ApplyContext = createContext<ApplyContextType | undefined>(undefined);

export const ApplyProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ApplyState>(initialState);

  // Load state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Pastikan structure documents & otherDocuments ada meskipun dari storage lama
        parsed.documents = defaultDocuments;
        parsed.otherDocuments = parsed.otherDocuments || []; 
        parsed.assessmentAnswers = parsed.assessmentAnswers || {}; // NEW
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) { console.warn(e); }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      const toStore = { ...state };
      toStore.documents = Object.fromEntries(Object.keys(defaultDocuments).map(k => [k, null])) as Documents;
      toStore.otherDocuments = []; // File tidak bisa disimpan di storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) { console.warn(e); }
  }, [state]);

  const setIdentityField = (name: string, value: any) => {
    setState((s) => ({ ...s, identity: { ...s.identity, [name]: value } }));
  };

  // --- ACTIONS ---
  const addSibling = () => setState(s => ({ ...s, siblings: [...s.siblings, { id: makeId("sib"), name: "", gender: "", age: "", relation: "", job: "" }] }));
  const updateSibling = (id: string, data: Partial<Sibling>) => setState(s => ({ ...s, siblings: s.siblings.map(it => it.id === id ? { ...it, ...data } : it) }));
  const removeSibling = (id: string) => setState(s => ({ ...s, siblings: s.siblings.filter(it => it.id !== id) }));

  const addEducationFormal = () => setState(s => ({ ...s, educationFormal: [...s.educationFormal, { id: makeId("eduF"), school: "", yearFrom: "", yearTo: "", certificateNo: "", ipk: "" }] }));
  const updateEducationFormal = (id: string, data: Partial<EducationItem>) => setState(s => ({ ...s, educationFormal: s.educationFormal.map(it => it.id === id ? { ...it, ...data } : it) }));
  const removeEducationFormal = (id: string) => setState(s => ({ ...s, educationFormal: s.educationFormal.filter(it => it.id !== id) }));

  const addEducationNonFormal = () => setState(s => ({ ...s, educationNonFormal: [...s.educationNonFormal, { id: makeId("eduN"), school: "", yearFrom: "", yearTo: "", certificateNo: "" }] }));
  const updateEducationNonFormal = (id: string, data: Partial<EducationItem>) => setState(s => ({ ...s, educationNonFormal: s.educationNonFormal.map(it => it.id === id ? { ...it, ...data } : it) }));
  const removeEducationNonFormal = (id: string) => setState(s => ({ ...s, educationNonFormal: s.educationNonFormal.filter(it => it.id !== id) }));

  const addExperience = () => setState(s => ({ ...s, experiences: [...s.experiences, { id: makeId("exp"), company: "", position: "", place: "", duration: "", fromYear: "", toYear: "", reasonLeave: "" }] }));
  const updateExperience = (id: string, data: Partial<ExperienceItem>) => setState(s => ({ ...s, experiences: s.experiences.map(it => it.id === id ? { ...it, ...data } : it) }));
  const removeExperience = (id: string) => setState(s => ({ ...s, experiences: s.experiences.filter(it => it.id !== id) }));

  const setDocumentFile = (key: keyof Documents, file: File | null) => {
    setState(s => ({ ...s, documents: { ...s.documents, [key]: file } }));
  };

  // --- NEW ACTIONS FOR OTHER DOCUMENTS ---
  const addOtherDocument = () => setState(s => ({ 
    ...s, 
    otherDocuments: [...(s.otherDocuments || []), { id: makeId("oth"), name: "", file: null }] 
  }));
  
  const updateOtherDocument = (id: string, data: Partial<OtherDocumentItem>) => setState(s => ({ 
    ...s, 
    otherDocuments: (s.otherDocuments || []).map(it => it.id === id ? { ...it, ...data } : it) 
  }));
  
  const removeOtherDocument = (id: string) => setState(s => ({ 
    ...s, 
    otherDocuments: (s.otherDocuments || []).filter(it => it.id !== id) 
  }));

  const setAssessmentAnswer = (questionId: string, value: any) => {
    setState(s => ({
      ...s,
      assessmentAnswers: {
        ...s.assessmentAnswers,
        [questionId]: value
      }
    }));
  };

  const resetAll = () => {
    setState(initialState);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  };

  const bulkSetData = (data: Partial<ApplyState>) => {
      setState(s => ({ ...s, ...data }));
  };

  return (
    <ApplyContext.Provider value={{ state, setIdentityField, addSibling, updateSibling, removeSibling, addEducationFormal, updateEducationFormal, removeEducationFormal, addEducationNonFormal, updateEducationNonFormal, removeEducationNonFormal, addExperience, updateExperience, removeExperience, setDocumentFile, addOtherDocument, updateOtherDocument, removeOtherDocument, setAssessmentAnswer, resetAll, bulkSetData }}>
      {children}
    </ApplyContext.Provider>
  );
};

export const useApply = () => {
  const ctx = useContext(ApplyContext);
  if (!ctx) throw new Error("useApply must be used inside ApplyProvider");
  return ctx;
};