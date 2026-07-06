// Shared types and constants for the public booking flow.

export type Screen = "home" | "booking" | "done";

export interface DraftPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  dob: string;
}

export interface SelectedSlot {
  date: string;
  time: string;
  startsAt: string;
  low: boolean;
  full: boolean;
}

export const STEPS = ["Test type", "Appointment", "Details"];
