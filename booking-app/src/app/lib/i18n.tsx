import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "de";

// Flat key → translation. Admin strings can be migrated onto t() incrementally.
const DICT: Record<Lang, Record<string, string>> = {
  en: {
    "nav.staffLogin": "Staff login",
    "home.badge": "Certified for travel & events",
    "home.title": "Book your corona test in a few simple steps.",
    "home.subtitle": "Choose a test type, pick a slot, and receive a QR confirmation and certificate by email.",
    "home.book": "Book appointment",
    "home.registered": "Already registered?",
    "home.registeredSub": "Enter your email and we'll resend your booking & rebooking link.",
    "home.sendLink": "Send booking link",
    "trust.secure": "Secure data",
    "trust.secureSub": "GDPR-compliant, encrypted.",
    "trust.fast": "Fast appointment",
    "trust.fastSub": "Slots every 15 minutes.",
    "trust.qr": "QR confirmation",
    "trust.qrSub": "Scan on arrival, no queue.",
    "trust.email": "Email certificate",
    "trust.emailSub": "Official PDF result.",
    "trust.help": "Need help?",
    "step.back": "Back",
    "step.continue": "Continue",
    "step.confirm": "Confirm booking",
    "step.confirming": "Confirming…",
    "step.1.title": "Select a test type",
    "step.1.sub": "Choose the test that fits your needs.",
    "step.2.title": "Select an appointment",
    "step.2.sub": "Availability updates in real time.",
    "step.3.title": "Who is getting tested?",
    "step.3.sub": "Add everyone in your booking. You can add several people.",
    "step.of": "Step {a} of {b}",
    "summary.title": "Booking summary",
    "summary.testType": "Test type",
    "summary.appointment": "Appointment",
    "summary.persons": "Persons",
    "summary.center": "Center",
    "summary.total": "Total",
    "summary.free": "Free",
    "summary.secure": "Encrypted & GDPR-compliant.",
    "done.title": "Booking confirmed",
    "done.sub": "A confirmation email with your QR code has been sent. Show it on arrival.",
    "done.scan": "Scan to verify at check-in",
    "done.downloadQr": "Download QR",
    "done.addCal": "Add to calendar",
    "done.another": "Book another",
    "done.home": "Go home",
    "field.firstName": "First name",
    "field.lastName": "Last name",
    "field.email": "Email",
    "field.phone": "Phone",
    "field.city": "City",
    "person.primary": "Primary person",
    "person.add": "Add another person",
    "person.remove": "Remove",
    "consent": "I agree to the privacy policy and the test-center's testing terms. My data may be transmitted to the health office as legally required.",
    "admin.nav.dashboard": "Dashboard",
    "admin.nav.today": "Today",
    "admin.nav.appointments": "Appointments",
    "admin.nav.patients": "Test persons",
    "admin.nav.archive": "Archive",
    "admin.nav.agents": "Agents",
    "admin.nav.settings": "Settings",
    "admin.nav.reports": "Reports & audit",
    "admin.enterprise": "Enterprise",
    "admin.signOut": "Sign out",
    "admin.collapse": "Collapse",
    "admin.newAppointment": "New appointment",
    "admin.search": "Search…",
    "admin.viewingAs": "Viewing as",
  },
  de: {
    "nav.staffLogin": "Mitarbeiter-Login",
    "home.badge": "Zertifiziert für Reisen & Veranstaltungen",
    "home.title": "Buchen Sie Ihren Corona-Test in wenigen Schritten.",
    "home.subtitle": "Wählen Sie eine Testart, einen Termin und erhalten Sie eine QR-Bestätigung und ein Zertifikat per E-Mail.",
    "home.book": "Termin buchen",
    "home.registered": "Bereits registriert?",
    "home.registeredSub": "Geben Sie Ihre E-Mail ein und wir senden Ihren Buchungslink erneut.",
    "home.sendLink": "Buchungslink senden",
    "trust.secure": "Sichere Daten",
    "trust.secureSub": "DSGVO-konform, verschlüsselt.",
    "trust.fast": "Schneller Termin",
    "trust.fastSub": "Termine alle 15 Minuten.",
    "trust.qr": "QR-Bestätigung",
    "trust.qrSub": "Beim Ankommen scannen, keine Warteschlange.",
    "trust.email": "E-Mail-Zertifikat",
    "trust.emailSub": "Offizielles PDF-Ergebnis.",
    "trust.help": "Brauchen Sie Hilfe?",
    "step.back": "Zurück",
    "step.continue": "Weiter",
    "step.confirm": "Buchung bestätigen",
    "step.confirming": "Wird bestätigt…",
    "step.1.title": "Testart auswählen",
    "step.1.sub": "Wählen Sie den passenden Test.",
    "step.2.title": "Termin auswählen",
    "step.2.sub": "Verfügbarkeit in Echtzeit.",
    "step.3.title": "Wer wird getestet?",
    "step.3.sub": "Fügen Sie alle Personen Ihrer Buchung hinzu.",
    "step.of": "Schritt {a} von {b}",
    "summary.title": "Buchungsübersicht",
    "summary.testType": "Testart",
    "summary.appointment": "Termin",
    "summary.persons": "Personen",
    "summary.center": "Zentrum",
    "summary.total": "Gesamt",
    "summary.free": "Kostenlos",
    "summary.secure": "Verschlüsselt & DSGVO-konform.",
    "done.title": "Buchung bestätigt",
    "done.sub": "Eine Bestätigungs-E-Mail mit Ihrem QR-Code wurde gesendet. Zeigen Sie ihn bei der Ankunft.",
    "done.scan": "Zum Verifizieren beim Check-in scannen",
    "done.downloadQr": "QR herunterladen",
    "done.addCal": "Zum Kalender hinzufügen",
    "done.another": "Weitere Buchung",
    "done.home": "Zur Startseite",
    "field.firstName": "Vorname",
    "field.lastName": "Nachname",
    "field.email": "E-Mail",
    "field.phone": "Telefon",
    "field.city": "Stadt",
    "person.primary": "Hauptperson",
    "person.add": "Weitere Person hinzufügen",
    "person.remove": "Entfernen",
    "consent": "Ich stimme der Datenschutzerklärung und den Testbedingungen des Testzentrums zu. Meine Daten dürfen gesetzlich vorgeschrieben an das Gesundheitsamt übermittelt werden.",
    "admin.nav.dashboard": "Übersicht",
    "admin.nav.today": "Heute",
    "admin.nav.appointments": "Termine",
    "admin.nav.patients": "Testpersonen",
    "admin.nav.archive": "Archiv",
    "admin.nav.agents": "Mitarbeiter",
    "admin.nav.settings": "Einstellungen",
    "admin.nav.reports": "Berichte & Audit",
    "admin.enterprise": "Enterprise",
    "admin.signOut": "Abmelden",
    "admin.collapse": "Einklappen",
    "admin.newAppointment": "Neuer Termin",
    "admin.search": "Suchen…",
    "admin.viewingAs": "Angemeldet als",
  },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);
const KEY = "rapid-test-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "en" || v === "de") return v;
    } catch {
      /* ignore */
    }
    return "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = DICT[lang][key] ?? DICT.en[key] ?? key;
      if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, String(vars[k]));
      return s;
    },
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex overflow-hidden rounded-lg border ${dark ? "border-white/20" : "border-border"} text-xs font-semibold`}>
      {(["en", "de"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2 py-1 text-[11px] uppercase leading-none transition-colors ${
            lang === l ? "bg-primary text-primary-foreground" : dark ? "text-slate-300 hover:bg-white/10" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
