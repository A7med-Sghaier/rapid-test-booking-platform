import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import {
  type Agent,
  type Appointment,
  type PatientRecord,
  type Center,
  EMPTY_CENTER,
  type TestType,
  localDay,
} from "../components/data";

export interface Kit {
  id: string;
  name: string;
}

export interface HealthOfficeTask {
  id: string;
  appointmentId: string;
  patientName: string;
  ref: string;
  createdAt: string;
  done: boolean;
}

export type Role = "Lead agent" | "Agent" | "Admin";

export interface BookedSlot {
  appointment: string;
  personsCount: number;
}

export interface AppState {
  center: Center;
  appointments: Appointment[];
  patients: PatientRecord[];
  agents: Agent[];
  testTypes: TestType[];
  kits: Kit[];
  activeKitId: string;
  bookedSlots: BookedSlot[];
  tasks: HealthOfficeTask[];
  role: Role;
}

// Empty baseline - the backend is the source of truth.
export const EMPTY_STATE: AppState = {
  center: EMPTY_CENTER,
  appointments: [],
  patients: [],
  agents: [],
  testTypes: [],
  kits: [],
  activeKitId: "",
  bookedSlots: [],
  tasks: [],
  role: "Lead agent",
};

type Action =
  | { type: "HYDRATE"; payload: Partial<AppState> }
  | { type: "SET_ROLE"; role: Role };

export type FluxAction = Action;

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      // Replace only the slices the backend provided; keep the rest.
      return { ...state, ...action.payload };
    case "SET_ROLE":
      return { ...state, role: action.role };
    default:
      return state;
  }
}

const STORAGE_KEY = "rapid-test-app-state-v1";
const LEGACY_STORAGE_KEYS = ["aurora-app-state-v1"];

function init(seed: AppState): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return seed;
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** Replace slices of state with data from the backend. */
  hydrate: (payload: Partial<AppState>) => void;
  // convenience selectors
  todayAppts: Appointment[];
}

const FluxContext = createContext<Ctx | null>(null);

export function FluxProvider({
  children,
  initialState,
  persist = false,
}: {
  children: ReactNode;
  /** Inject DB-loaded state here. */
  initialState?: AppState;
  /** Enable only when explicit browser persistence is needed. */
  persist?: boolean;
}) {
  const [state, dispatch] = useReducer(reducer, initialState ?? EMPTY_STATE, (seed) =>
    persist ? init(seed) : seed,
  );

  useEffect(() => {
    if (!persist) {
      localStorage.removeItem(STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, persist]);

  const value = useMemo<Ctx>(() => {
    const today = localDay(new Date());
    return {
      state,
      dispatch,
      hydrate: (payload: Partial<AppState>) => dispatch({ type: "HYDRATE", payload }),
      todayAppts: state.appointments.filter((a) => a.date === today),
    };
  }, [state]);

  return <FluxContext.Provider value={value}>{children}</FluxContext.Provider>;
}

export function useFlux() {
  const ctx = useContext(FluxContext);
  if (!ctx) throw new Error("useFlux must be used within FluxProvider");
  return ctx;
}
