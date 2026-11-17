"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  COURSES,
  MAJORS,
  MINORS,
  type MajorId,
  type MinorId,
  type WorkloadPreference,
} from "../lib/catalog";
import { DEFAULT_PROFILE, type PlannerProfile } from "../lib/planner";

const STORAGE_KEY = "bupath-planner-profile-v2";

type Listener = () => void;
const listeners = new Set<Listener>();
let currentProfile = DEFAULT_PROFILE;
let currentStorageWarning = "";

function notifyListeners() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type PlannerContextValue = {
  profile: PlannerProfile;
  updateProfile: (changes: Partial<PlannerProfile>) => void;
  storageWarning: string;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

function isMajorId(value: unknown): value is MajorId {
  return MAJORS.some((major) => major.id === value);
}

function isMinorId(value: unknown): value is MinorId {
  return MINORS.some((minor) => minor.id === value);
}

function isWorkloadPreference(value: unknown): value is WorkloadPreference {
  return value === "lighter" || value === "balanced" || value === "challenging";
}

function readProfile(value: unknown): PlannerProfile | null {
  if (typeof value !== "object" || value === null) return null;
  const saved = value as Record<string, unknown>;
  if (!isMajorId(saved.majorId) || !isMinorId(saved.minorId)) return null;
  if (!Array.isArray(saved.completedCourseCodes) || !Array.isArray(saved.dismissedCourseCodes)) return null;
  if (
    typeof saved.catalogYear !== "number"
    || !Number.isInteger(saved.catalogYear)
    || saved.catalogYear < 2020
    || saved.catalogYear > 2026
    || typeof saved.startSemester !== "string"
    || !/^(Fall|Spring) 20\d{2}$/.test(saved.startSemester)
  ) return null;
  if (typeof saved.targetCredits !== "number" || !isWorkloadPreference(saved.workload)) return null;
  if (![12, 16, 20].includes(saved.targetCredits)) return null;

  const courseCodes = new Set(COURSES.map((course) => course.code));
  const completedCourseCodes = [...new Set(saved.completedCourseCodes.filter(
    (code): code is string => typeof code === "string" && courseCodes.has(code),
  ))];
  const dismissedCourseCodes = [...new Set(saved.dismissedCourseCodes.filter(
    (code): code is string => typeof code === "string" && courseCodes.has(code),
  ))];

  return {
    majorId: saved.majorId,
    minorId: saved.minorId,
    catalogYear: saved.catalogYear,
    completedCourseCodes,
    startSemester: saved.startSemester,
    targetCredits: saved.targetCredits,
    workload: saved.workload,
    dismissedCourseCodes,
  };
}

function loadProfile() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      const storedProfile = readProfile(parsed);
      if (storedProfile) {
        currentProfile = storedProfile;
      } else {
        currentStorageWarning = "Saved planner preferences could not be read. Update them below to create a fresh plan.";
      }
    }
  } catch {
    currentStorageWarning = "Planner preferences could not be loaded from this browser.";
  }
  notifyListeners();
}

function updateStoredProfile(changes: Partial<PlannerProfile>) {
  currentProfile = { ...currentProfile, ...changes };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile));
    currentStorageWarning = "";
  } catch {
    currentStorageWarning = "Your changes are not being saved in this browser.";
  }
  notifyListeners();
}

function loadProfileFromStorageEvent(event: StorageEvent) {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try {
    const parsed: unknown = JSON.parse(event.newValue);
    const storedProfile = readProfile(parsed);
    if (storedProfile) {
      currentProfile = storedProfile;
      currentStorageWarning = "";
    } else {
      currentStorageWarning = "Saved planner preferences could not be read.";
    }
  } catch {
    currentStorageWarning = "Saved planner preferences could not be read.";
  }
  notifyListeners();
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const profile = useSyncExternalStore(subscribe, () => currentProfile, () => DEFAULT_PROFILE);
  const storageWarning = useSyncExternalStore(
    subscribe,
    () => currentStorageWarning,
    () => "",
  );

  useEffect(() => {
    loadProfile();
    window.addEventListener("storage", loadProfileFromStorageEvent);
    return () => window.removeEventListener("storage", loadProfileFromStorageEvent);
  }, []);

  const value: PlannerContextValue = {
    profile,
    updateProfile: updateStoredProfile,
    storageWarning,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlanner must be used within PlannerProvider");
  return context;
}
