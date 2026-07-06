import { useState } from "react";
import { CalendarCheck, Clock, Mail, Phone, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import type { Center } from "../../components/data";
import { TrustBadge } from "../../shared";
import { useI18n } from "../../lib/i18n";

/** Public landing page: hero, returning-visitor lookup and trust badges. */
export function HomeScreen({ center, onStart }: { center: Center; onStart: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const phone = center.phone?.trim();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-[color:var(--accent-foreground)]">
            <Sparkles className="h-3.5 w-3.5" /> {t("home.badge")}
          </span>
          <h1 className="mt-4 font-[var(--font-display)] text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            {t("home.subtitle")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <CalendarCheck className="h-4.5 w-4.5" /> {t("home.book")}
            </button>
          </div>

          {/* Returning */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">{t("home.registered")}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("home.registeredSub")}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
                {t("home.sendLink")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TrustBadge icon={<ShieldCheck className="h-5 w-5" />} title={t("trust.secure")} sub={t("trust.secureSub")} />
          <TrustBadge icon={<Clock className="h-5 w-5" />} title={t("trust.fast")} sub={t("trust.fastSub")} />
          <TrustBadge icon={<QrCode className="h-5 w-5" />} title={t("trust.qr")} sub={t("trust.qrSub")} />
          <TrustBadge icon={<Mail className="h-5 w-5" />} title={t("trust.email")} sub={t("trust.emailSub")} />
          <div className="rounded-2xl bg-primary p-5 text-primary-foreground sm:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4" /> {t("trust.help")}
            </div>
            <p className="mt-1 text-sm text-white/80">
              {phone ? `Call ${phone}` : "Contact the test center"}.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
