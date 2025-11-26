"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Sibling = {
  id: string;
  name: string;
  gender: string;
  age: string;
  relation: string;
  job: string;
};

type EducationItem = {
  id: string;
  school: string;
  yearFrom: string;
  yearTo: string;
  certificateNo: string;
};

type ExperienceItem = {
  id: string;
  company: string;
  position: string;
  place: string;
  duration: string;
  fromYear: string;
  toYear: string;
  reasonLeave: string;
};

type Documents = Record<
  "cv" | "photo" | "ktp" | "ijazah" | "kk" | "str" | "transkrip",
  File | null
>;

type ApplyState = {
  identity: Record<string, any>;
  siblings: Sibling[];
  educationFormal: EducationItem[];
  educationNonFormal: EducationItem[];
  experiences: ExperienceItem[];
  documents: Documents;
};

type ApplyContextType = {
  state: ApplyState;
  setIdentityField: (name: string, value: any) => void;
  // siblings
  addSibling: () => void;
  updateSibling: (id: string, data: Partial<Sibling>) => void;
  removeSibling: (id: string) => void;
  // education
  addEducationFormal: () => void;
  updateEducationFormal: (id: string, data: Partial<EducationItem>) => void;
  removeEducationFormal: (id: string) => void;
  addEducationNonFormal: () => void;
  updateEducationNonFormal: (id: string, data: Partial<EducationItem>) => void;
  removeEducationNonFormal: (id: string) => void;
  // experiences
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  // documents
  setDocumentFile: (key: keyof Documents, file: File | null) => void;
  // utilities
  resetAll: () => void;
};

const defaultDocuments: Documents = {
  cv: null,
  photo: null,
  ktp: null,
  ijazah: null,
  kk: null,
  str: null,
  transkrip: null,
};

const makeId = (p = "") =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${p}`;

const initialState: ApplyState = {
  identity: {
    fullName: "",
    email: "",
    whatsapp: "",
    birthPlace: "",
    birthDate: "",
    ethnicity: "",
    religion: "",
    ktp: "",
    address: "",
    maritalStatus: "",
    spouseName: "",
    spouseBirthPlace: "",
    spouseBirthDate: "",
    childrenCount: "",
    spousePhone: "",
    fatherName: "",
    fatherJob: "",
    fatherPhone: "",
    motherName: "",
    motherJob: "",
    motherPhone: "",
  },
  siblings: [],
  educationFormal: [],
  educationNonFormal: [],
  experiences: [],
  documents: defaultDocuments,
};

const STORAGE_KEY = "apply_form_v1";

const ApplyContext = createContext<ApplyContextType | undefined>(undefined);

export const ApplyProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ApplyState>(initialState);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // documents can't be restored; keep as nulls
        parsed.documents = defaultDocuments;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed to load apply state", e);
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      const toStore = { ...state };
      // remove File objects before storing
      toStore.documents = Object.fromEntries(
        Object.entries(toStore.documents).map(([k]) => [k, null])
      ) as Documents;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn("Failed to save apply state", e);
    }
  }, [state]);

  const setIdentityField = (name: string, value: any) => {
    setState((s) => ({ ...s, identity: { ...s.identity, [name]: value } }));
  };

  // siblings
  const addSibling = () =>
    setState((s) => ({
      ...s,
      siblings: [
        ...s.siblings,
        { id: makeId("sib"), name: "", gender: "", age: "", relation: "", job: "" },
      ],
    }));
  const updateSibling = (id: string, data: Partial<Sibling>) =>
    setState((s) => ({ ...s, siblings: s.siblings.map((it) => (it.id === id ? { ...it, ...data } : it)) }));
  const removeSibling = (id: string) => setState((s) => ({ ...s, siblings: s.siblings.filter((it) => it.id !== id) }));

  // education formal
  const addEducationFormal = () =>
    setState((s) => ({
      ...s,
      educationFormal: [...s.educationFormal, { id: makeId("eduF"), school: "", yearFrom: "", yearTo: "", certificateNo: "" }],
    }));
  const updateEducationFormal = (id: string, data: Partial<EducationItem>) =>
    setState((s) => ({ ...s, educationFormal: s.educationFormal.map((it) => (it.id === id ? { ...it, ...data } : it)) }));
  const removeEducationFormal = (id: string) =>
    setState((s) => ({ ...s, educationFormal: s.educationFormal.filter((it) => it.id !== id) }));

  // education non formal
  const addEducationNonFormal = () =>
    setState((s) => ({
      ...s,
      educationNonFormal: [...s.educationNonFormal, { id: makeId("eduN"), school: "", yearFrom: "", yearTo: "", certificateNo: "" }],
    }));
  const updateEducationNonFormal = (id: string, data: Partial<EducationItem>) =>
    setState((s) => ({ ...s, educationNonFormal: s.educationNonFormal.map((it) => (it.id === id ? { ...it, ...data } : it)) }));
  const removeEducationNonFormal = (id: string) =>
    setState((s) => ({ ...s, educationNonFormal: s.educationNonFormal.filter((it) => it.id !== id) }));

  // experiences
  const addExperience = () =>
    setState((s) => ({
      ...s,
      experiences: [...s.experiences, { id: makeId("exp"), company: "", position: "", place: "", duration: "", fromYear: "", toYear: "", reasonLeave: "" }],
    }));
  const updateExperience = (id: string, data: Partial<ExperienceItem>) =>
    setState((s) => ({ ...s, experiences: s.experiences.map((it) => (it.id === id ? { ...it, ...data } : it)) }));
  const removeExperience = (id: string) => setState((s) => ({ ...s, experiences: s.experiences.filter((it) => it.id !== id) }));

  // documents
  const setDocumentFile = (key: keyof Documents, file: File | null) => {
    setState((s) => ({ ...s, documents: { ...s.documents, [key]: file } }));
  };

  const resetAll = () => {
    setState(initialState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <ApplyContext.Provider
      value={{
        state,
        setIdentityField,
        addSibling,
        updateSibling,
        removeSibling,
        addEducationFormal,
        updateEducationFormal,
        removeEducationFormal,
        addEducationNonFormal,
        updateEducationNonFormal,
        removeEducationNonFormal,
        addExperience,
        updateExperience,
        removeExperience,
        setDocumentFile,
        resetAll,
      }}
    >
      {children}
    </ApplyContext.Provider>
  );
};

export const useApply = () => {
  const ctx = useContext(ApplyContext);
  if (!ctx) throw new Error("useApply must be used inside ApplyProvider");
  return ctx;
};
