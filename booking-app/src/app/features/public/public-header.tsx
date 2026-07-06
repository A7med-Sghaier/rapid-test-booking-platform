import { MapPin } from "lucide-react";
import type { Center } from "../../components/data";
import { Logo } from "../../shared";
import { LanguageToggle } from "../../lib/i18n";

/** Sticky public site header with brand, center location and language toggle. */
export function PublicHeader({ center }: { center: Center }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          {(center.address || center.city) && (
            <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <MapPin className="h-4 w-4" /> {[center.address, center.city].filter(Boolean).join(", ")}
            </span>
          )}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
