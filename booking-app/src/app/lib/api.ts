import type {
  Agent,
  Appointment,
  AppointmentStatus,
  Center,
  PatientRecord,
  Person,
  TestResult,
  TestType,
} from "../components/data";
import { EMPTY_CENTER, localDay, timeLabel } from "../components/data";
import type { AppState, BookedSlot, HealthOfficeTask, Kit } from "../store/flux-store";

type Env = Record<string, string | undefined>;

interface BackendTestType {
  label?: string;
  price?: string | number;
  isActive?: boolean;
  active?: boolean;
}

interface BackendTestKit {
  _id?: string | { $oid?: string };
  id?: string;
  label?: string;
  name?: string;
  isActive?: boolean;
}

interface BackendCenter {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string | number;
  country?: string;
  telephone?: string;
  phone?: string;
  openingTimes?: Center["openingTimes"];
  maxPerSlot?: string | number;
  healthOfficeEmail?: string;
  logo?: string;
  testTypes?: BackendTestType[];
  testKits?: BackendTestKit[];
}

interface BackendPerson {
  _id?: string | { $oid?: string };
  uid?: string;
  firstName?: string;
  secondName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
  phone?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  status?: string;
  testResult?: string;
  checkedInAt?: string;
  resultEmittedAt?: string;
  checkedInBy?: string;
  resultEmittedBy?: string;
  cwaQr?: string;
  coronaWarnApp?: boolean;
  vaccinated?: boolean;
}

interface BackendAppointmentRow {
  _id?: string | { $oid?: string };
  appointment?: string;
  appointmentUid?: string;
  person?: BackendPerson;
  personIdx?: number;
  testType?: BackendTestType;
}

interface BackendAgent {
  _id?: string | { $oid?: string };
  id?: string;
  firstName?: string;
  secondName?: string;
  lastName?: string;
  userName?: string;
  username?: string;
  email?: string;
  roles?: string[];
  role?: string;
  active?: boolean;
}

export type SettingsPayload = Partial<Center> & {
  testTypes?: TestType[];
  kits?: Kit[];
  activeKitId?: string;
};

interface BookingDraftPerson {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  dob?: string;
  address?: string;
  postalCode?: string;
  country?: string;
}

export interface BookingDraft {
  center: Center;
  testType: TestType;
  startsAt: string;
  persons: BookingDraftPerson[];
  consentAccepted: boolean;
}

export interface AuthResult {
  access_token?: string;
  ok?: boolean;
  error?: string;
}

const LEGACY_TOKEN_KEY = "rapid-test-token";

function envValue(...keys: string[]) {
  const env = import.meta.env as Env;
  return keys.map((key) => env[key]).find(Boolean);
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function baseUrl() {
  const host = envValue("VITE_API_HOST", "REACT_APP_API_HOST") ?? "http://localhost";
  const port = envValue("VITE_API_PORT", "REACT_APP_API_PORT") ?? "3500";
  if (!port || /:\d+$/.test(host)) return host.replace(/\/+$/, "");
  return `${host.replace(/\/+$/, "")}:${port}`;
}

function prefixedPath(path: string) {
  const prefix = envValue("VITE_API_PATH_PREFIX", "REACT_APP_API_PATH_PREFIX") ?? "test-app-api";
  const normalized = normalizePath(path);
  return prefix ? `/${prefix.replace(/^\/+|\/+$/g, "")}${normalized}` : normalized;
}

export function apiUrl(path: string) {
  return `${baseUrl()}${prefixedPath(path)}`;
}

function directApiUrl(path: string) {
  return `${baseUrl()}${normalizePath(path)}`;
}

function tokenKey() {
  return envValue("VITE_TOKEN_NAME", "REACT_APP_TOKEN_NAME") ?? LEGACY_TOKEN_KEY;
}

export function getAuthToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(tokenKey());
}

export async function apiFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  const requestInit: RequestInit = { ...init, headers };
  const response = await fetch(apiUrl(path), requestInit);
  if (response.status !== 404) return response;
  return fetch(directApiUrl(path), requestInit);
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function safe<T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.warn(`Could not load ${label}`, error);
    return fallback;
  }
}

export async function login(userName: string, password: string): Promise<AuthResult> {
  return apiJson<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ userName, password }),
  });
}

export async function addAgent(agent: Agent) {
  return apiJson<unknown>("/admin/add-agent", {
    method: "PUT",
    body: JSON.stringify(toBackendAgent(agent)),
  });
}

export async function updateAgent(agent: Agent) {
  return apiJson<unknown>("/admin/update-agent", {
    method: "POST",
    body: JSON.stringify({
      id: agent.id,
      data: toBackendAgent(agent),
    }),
  });
}

export async function saveSettings(payload: SettingsPayload) {
  return apiJson<unknown>("/admin/settings", {
    method: "POST",
    body: JSON.stringify(toBackendSettings(payload)),
  });
}

export function storeAuthToken(auth: AuthResult) {
  if (!auth.access_token) return;
  localStorage.setItem("auth", JSON.stringify(auth));
  localStorage.setItem(envValue("VITE_TOKEN_NAME", "REACT_APP_TOKEN_NAME") ?? LEGACY_TOKEN_KEY, auth.access_token);
}

export function hasAuthToken() {
  return Boolean(localStorage.getItem("auth") || localStorage.getItem(envValue("VITE_TOKEN_NAME", "REACT_APP_TOKEN_NAME") ?? LEGACY_TOKEN_KEY));
}

export function clearAuthToken() {
  localStorage.removeItem("auth");
  localStorage.removeItem(envValue("VITE_TOKEN_NAME", "REACT_APP_TOKEN_NAME") ?? LEGACY_TOKEN_KEY);
}

export async function createBooking(draft: BookingDraft) {
  return apiJson<{ ok?: boolean; data?: string; warning?: string }>("/book-test-appointment", {
    method: "PUT",
    body: JSON.stringify({
      center: toBackendCenter(draft.center),
      testType: toBackendTestType(draft.testType),
      appointment: new Date(draft.startsAt).toISOString(),
      persons: draft.persons.map(toBackendPerson),
      status: "waiting",
      yetaPolicyAccepted: draft.consentAccepted,
      pocPolicyAccepted: draft.consentAccepted,
    }),
  });
}

export async function checkInAppointment(appointment: Appointment, agentId: string) {
  if (!appointment.appointmentUid || !appointment.personUid) throw new Error("Missing backend appointment or person id");
  return apiJson<unknown>("/admin/appointments/checkIns", {
    method: "POST",
    body: JSON.stringify({
      appointmentId: appointment.appointmentUid,
      personUid: appointment.personUid,
      agentId,
    }),
  });
}

export async function cancelAppointment(appointment: Appointment, agentId: string) {
  if (!appointment.appointmentUid || !appointment.personUid) throw new Error("Missing backend appointment or person id");
  return apiJson<unknown>("/admin/appointments/cancel", {
    method: "POST",
    body: JSON.stringify({
      appointmentId: appointment.appointmentUid,
      personUid: [appointment.personUid],
      agentId,
    }),
  });
}

export async function emitAppointmentResult(
  appointment: Appointment,
  result: TestResult,
  agentId: string,
  testKit: string,
) {
  if (!appointment.appointmentUid || !appointment.personUid) throw new Error("Missing backend appointment or person id");
  return apiJson<unknown>("/admin/emit-result", {
    method: "POST",
    body: JSON.stringify({
      appointmentUid: appointment.appointmentUid,
      uid: appointment.personUid,
      testResult: result,
      person: appointment.backendPerson ?? toBackendPersonFromAppointment(appointment),
      agentId,
      testData: appointment.backendRecord ?? appointment,
      testKit,
    }),
  });
}

export async function loadRealAppState(): Promise<Partial<AppState>> {
  const settings = await safe("settings", () => apiJson<BackendCenter[]>("/admin/settings"), []);
  const center = mapCenter(settings[0]);
  const from = new Date("2000-01-01T00:00:00.000Z").toISOString();
  const to = new Date("2100-01-01T00:00:00.000Z").toISOString();

  const [appointmentRows, clients, backendAgents, bookedSlots] = await Promise.all([
    safe("appointments", () => apiJson<BackendAppointmentRow[]>(`/admin/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`), []),
    safe("clients", () => apiJson<BackendPerson[]>("/admin/clients"), []),
    safe("agents", () => apiJson<BackendAgent[]>("/admin/agents"), []),
    safe("booked slots", () => apiJson<BookedSlot[]>("/book-test-appointment/booked-slots"), []),
  ]);

  const appointments = mapAppointments(appointmentRows);
  const testTypes = mergeTestTypes(mapTestTypes(settings[0]?.testTypes), appointmentRows);
  const agents = mapAgents(backendAgents, appointments);
  const patients = mapPatients(clients, appointments);
  const kits = mapKits(settings[0]?.testKits);
  const activeKitId = kits.find((kit) => kit.id.endsWith(":active"))?.id ?? kits[0]?.id ?? "";
  const tasks = mapHealthOfficeTasks(appointments);

  return { center, appointments, patients, agents, testTypes, kits, activeKitId, bookedSlots, tasks };
}

function toBackendCenter(center: Center) {
  return {
    ...center,
    testTypes: undefined,
    testKits: undefined,
  };
}

function toBackendSettings(payload: SettingsPayload) {
  const { kits, testTypes, ...center } = payload;
  return {
    ...center,
    maxPerSlot: center.maxPerSlot !== undefined ? Number(center.maxPerSlot) : undefined,
    testTypes: testTypes?.map(toBackendTestType),
    testKits: kits?.map((kit) => ({
      label: kit.name,
      isActive: kit.id === payload.activeKitId,
    })),
  };
}

function toBackendAgent(agent: Agent) {
  return {
    userName: agent.username,
    username: agent.username,
    firstName: agent.firstName,
    secondName: agent.lastName,
    email: agent.email,
    roles: [agent.role],
    role: agent.role,
    active: agent.status === "active",
  };
}

function toBackendTestType(testType: TestType): BackendTestType {
  return {
    label: testType.label,
    price: testType.price,
    isActive: testType.active,
  };
}

function toBackendPerson(person: BookingDraftPerson) {
  return {
    firstName: person.firstName,
    secondName: person.lastName,
    birthDate: person.dob || undefined,
    email: person.email,
    email_repeat: person.email,
    telephone: person.phone,
    address: person.address || "",
    city: person.city,
    postalCode: person.postalCode ? Number(person.postalCode) : undefined,
    country: person.country || undefined,
    status: "waiting",
  };
}

function toBackendPersonFromAppointment(appointment: Appointment) {
  return {
    firstName: appointment.person.firstName,
    secondName: appointment.person.lastName,
    email: appointment.person.email,
    telephone: appointment.person.phone,
    city: appointment.person.city,
    uid: appointment.personUid,
    status: appointment.status,
    testResult: appointment.result,
  };
}

function mapCenter(center?: BackendCenter): Center {
  if (!center) return EMPTY_CENTER;
  return {
    name: center.name ?? "",
    address: center.address ?? "",
    city: center.city ?? "",
    postalCode: center.postalCode,
    country: center.country,
    phone: center.phone ?? center.telephone ?? "",
    openingTimes: center.openingTimes ?? {},
    maxPerSlot: Number(center.maxPerSlot ?? 0),
    healthOfficeEmail: center.healthOfficeEmail,
    logo: center.logo,
    testKits: center.testKits,
  };
}

function mapTestTypes(testTypes?: BackendTestType[]): TestType[] {
  return (testTypes ?? [])
    .filter((testType) => Boolean(testType.label))
    .map((testType) => ({
      id: slug(testType.label ?? "test"),
      label: testType.label ?? "Test",
      price: Number(testType.price ?? 0),
      durationMin: 15,
      description: "",
      active: testType.isActive ?? testType.active ?? true,
    }));
}

function mergeTestTypes(types: TestType[], rows: BackendAppointmentRow[]) {
  const byId = new Map(types.map((testType) => [testType.id, testType]));
  rows.forEach((row) => {
    const label = row.testType?.label;
    if (!label) return;
    const id = slug(label);
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        label,
        price: Number(row.testType?.price ?? 0),
        durationMin: 15,
        description: "",
        active: true,
      });
    }
  });
  return Array.from(byId.values());
}

function mapAppointments(rows: BackendAppointmentRow[]): Appointment[] {
  const personsByAppointment = new Map<string, number>();
  rows.forEach((row) => {
    const key = row.appointmentUid ?? String(row._id ?? row.appointment ?? "");
    personsByAppointment.set(key, (personsByAppointment.get(key) ?? 0) + 1);
  });

  return rows
    .filter((row) => row.appointment && row.person)
    .map((row, idx) => {
      const startsAt = new Date(row.appointment as string);
      const person = row.person as BackendPerson;
      const appointmentUid = row.appointmentUid ?? objectId(row._id) ?? `appointment:${startsAt.toISOString()}:${idx}`;
      const personUid = person.uid ?? `${appointmentUid}:${row.personIdx ?? idx}`;
      const status = mapStatus(person);
      const result = mapResult(person.testResult);
      const checkedInAt = parseTime(person.checkedInAt);
      const completedAt = parseTime(person.resultEmittedAt);
      return {
        id: `${appointmentUid}:${personUid}`,
        ref: appointmentUid,
        person: mapPerson(person, personUid),
        testTypeId: slug(row.testType?.label ?? "test"),
        time: timeLabel(startsAt),
        date: localDay(startsAt),
        status,
        result,
        checkedInAt,
        completedAt,
        agent: person.resultEmittedBy ?? person.checkedInBy,
        persons: personsByAppointment.get(appointmentUid) ?? 1,
        turnaroundMin: minutesBetween(person.checkedInAt, person.resultEmittedAt),
        certificateId: result ? `CERT-${personUid}` : undefined,
        transmitted: Boolean(person.cwaQr),
        appointmentUid,
        personUid,
        backendPerson: person,
        backendRecord: row,
      } satisfies Appointment;
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

function mapPerson(person: BackendPerson, fallbackId: string): Person {
  return {
    id: person.uid ?? fallbackId,
    firstName: person.firstName ?? "",
    lastName: person.secondName ?? person.lastName ?? "",
    email: person.email ?? "",
    phone: person.telephone ?? person.phone ?? "",
    city: person.city ?? "",
  };
}

function mapPatients(clients: BackendPerson[], appointments: Appointment[]): PatientRecord[] {
  const byKey = new Map<string, BackendPerson>();
  clients.forEach((client) => byKey.set(patientKey(client, objectId(client._id) ?? client.uid ?? ""), client));
  appointments.forEach((appointment) => {
    const backendPerson = appointment.backendPerson as BackendPerson | undefined;
    if (!backendPerson) return;
    const key = patientKey(backendPerson, appointment.person.id);
    if (!byKey.has(key)) byKey.set(key, backendPerson);
  });

  return Array.from(byKey.values()).map((person, idx) => {
    const related = appointments.filter((appointment) => {
      const backend = appointment.backendPerson as BackendPerson | undefined;
      return patientKey(backend ?? {}, appointment.person.id) === patientKey(person, objectId(person._id) ?? person.uid ?? String(idx));
    });
    const latest = [...related].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0];
    const lastResult = latest?.result ?? "negative";
    return {
      ...mapPerson(person, person.uid ?? objectId(person._id) ?? patientKey(person, String(idx))),
      dob: normalizeDay(person.birthDate) ?? "",
      gender: mapGender(person.gender),
      visits: related.length,
      lastVisit: latest ? latest.date : "",
      lastResult,
      lastTestTypeId: latest?.testTypeId ?? "",
      vaccinated: Boolean(person.vaccinated),
      coronaWarnApp: Boolean(person.coronaWarnApp ?? person.cwaQr),
    };
  });
}

function mapAgents(agents: BackendAgent[], appointments: Appointment[]): Agent[] {
  const today = localDay(new Date());
  return agents.map((agent, idx) => {
    const id = objectId(agent._id) ?? agent.id ?? agent.userName ?? agent.username ?? agent.email ?? `agent:${idx}`;
    const firstName = agent.firstName ?? "";
    const lastName = agent.secondName ?? agent.lastName ?? "";
    return {
      id,
      firstName,
      lastName,
      username: agent.userName ?? agent.username ?? agent.email ?? "",
      email: agent.email ?? "",
      role: mapRole(agent.role ?? agent.roles?.[0]),
      status: agent.active === false ? "away" : "active",
      checkedInToday: appointments.filter((appointment) => appointment.date === today && appointment.agent === id && appointment.checkedInAt).length,
      resultsToday: appointments.filter((appointment) => appointment.date === today && appointment.agent === id && appointment.completedAt).length,
      lastActive: agent.active === false ? "inactive" : "active",
    };
  });
}

function mapKits(kits?: BackendTestKit[]): Kit[] {
  return (kits ?? [])
    .filter((kit) => Boolean(kit.label ?? kit.name))
    .map((kit, idx) => ({
      id: objectId(kit._id) ?? kit.id ?? `${slug(kit.label ?? kit.name ?? "kit")}:${idx}${kit.isActive ? ":active" : ""}`,
      name: kit.label ?? kit.name ?? "",
    }));
}

function mapHealthOfficeTasks(appointments: Appointment[]): HealthOfficeTask[] {
  return appointments
    .filter((appointment) => appointment.result === "positive" && !appointment.transmitted)
    .map((appointment) => ({
      id: `task-${appointment.id}`,
      appointmentId: appointment.id,
      patientName: `${appointment.person.firstName} ${appointment.person.lastName}`.trim(),
      ref: appointment.ref,
      createdAt: appointment.completedAt ?? appointment.time,
      done: false,
    }));
}

function mapStatus(person: BackendPerson): AppointmentStatus {
  if (person.status === "checkedIn") return "checked-in";
  if (person.status === "testPerformed" || person.testResult) return "completed";
  if (person.status === "canceled") return "canceled";
  return "waiting";
}

function mapResult(result?: string): TestResult | undefined {
  return result === "negative" || result === "positive" || result === "invalid" ? result : undefined;
}

function mapGender(gender?: string): PatientRecord["gender"] {
  if (gender === "M" || gender?.toLowerCase().startsWith("m")) return "M";
  if (gender === "D" || gender?.toLowerCase().startsWith("d")) return "D";
  return "F";
}

function mapRole(role?: string): Agent["role"] {
  const normalized = role?.toLowerCase() ?? "";
  if (normalized.includes("admin")) return "Admin";
  if (normalized.includes("lead")) return "Lead agent";
  return "Agent";
}

function normalizeDay(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return localDay(date);
}

function parseTime(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return timeLabel(date);
}

function minutesBetween(from?: string, to?: string) {
  if (!from || !to) return undefined;
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return undefined;
  return Math.round((end - start) / 60000);
}

function objectId(value?: string | { $oid?: string }) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.$oid;
}

function patientKey(person: BackendPerson, fallback: string) {
  return [
    person.firstName?.trim().toLowerCase(),
    (person.secondName ?? person.lastName)?.trim().toLowerCase(),
    person.email?.trim().toLowerCase(),
    normalizeDay(person.birthDate),
  ].filter(Boolean).join(":") || fallback;
}

function slug(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "test";
}
