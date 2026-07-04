// Domain models for the Rapid Corona Test platform.
// Runtime records are loaded from the API; this file contains only shared types and empty defaults.

export type AppointmentStatus = "waiting" | "checked-in" | "completed" | "canceled";
export type TestResult = "negative" | "positive" | "invalid";

export interface TestType {
  id: string;
  label: string;
  price: number;
  durationMin: number;
  description: string;
  badge?: "Popular" | "Fastest" | "Official";
  active: boolean;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
}

export interface Appointment {
  id: string;
  ref: string;
  person: Person;
  testTypeId: string;
  time: string;
  date: string;
  status: AppointmentStatus;
  result?: TestResult;
  checkedInAt?: string;
  completedAt?: string;
  agent?: string;
  persons: number;
  turnaroundMin?: number;
  waitMin?: number;
  certificateId?: string;
  transmitted?: boolean;
  appointmentUid?: string;
  personUid?: string;
  backendPerson?: unknown;
  backendRecord?: unknown;
}

export interface OpeningTime {
  isOpen?: boolean;
  from?: string;
  to?: string;
}

export interface Center {
  name: string;
  address: string;
  city: string;
  postalCode?: string | number;
  country?: string;
  phone?: string;
  openingTimes?: Record<string, OpeningTime>;
  maxPerSlot?: number;
  healthOfficeEmail?: string;
  logo?: string;
  testKits?: { label?: string; name?: string; isActive?: boolean }[];
}

export const EMPTY_CENTER: Center = {
  name: "",
  address: "",
  city: "",
  phone: "",
  openingTimes: {},
  maxPerSlot: 0,
};

// Local (not UTC) ISO day - avoids off-by-one in western timezones.
export function localDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function timeLabel(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const testTypeById = (id: string, testTypes: TestType[]) => testTypes.find((t) => t.id === id);

export const priceLabel = (p: number) => (p === 0 ? "Free" : `€${p.toFixed(0)}`);

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "Lead agent" | "Agent" | "Admin";
  status: "active" | "away";
  checkedInToday: number;
  resultsToday: number;
  lastActive: string;
}

export interface PatientRecord extends Person {
  dob: string;
  gender: "F" | "M" | "D";
  visits: number;
  lastVisit: string;
  lastResult: TestResult;
  lastTestTypeId: string;
  vaccinated: boolean;
  coronaWarnApp: boolean;
}

export interface ArchivedRecord {
  id: string;
  ref: string;
  name: string;
  testTypeId: string;
  result: TestResult;
  date: string;
  agent: string;
  certificateId: string;
  transmittedToHealthOffice: boolean;
}
