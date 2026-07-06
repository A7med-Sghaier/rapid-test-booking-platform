import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AdminApp } from "./features/admin/admin-app";
import { PublicApp } from "./features/public/public-app";
import { VerifyPage } from "./components/verify";
import { ErrorBoundary } from "./components/error-boundary";
import { BackendSync } from "./lib/backend-sync";
import { I18nProvider } from "./lib/i18n";
import { FluxProvider } from "./store/flux-store";

type Route = { kind: "public" } | { kind: "admin" } | { kind: "verify"; id: string };

function parseRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  const verify = path.match(/\/verify\/([^/]+)$/);
  if (verify) return { kind: "verify", id: decodeURIComponent(verify[1]) };
  if (path.endsWith("/admin") || path.includes("/admin/")) return { kind: "admin" };
  return { kind: "public" };
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseRoute());

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function base() {
    return window.location.pathname.replace(/\/(admin|verify)(\/.*)?$/i, "").replace(/\/+$/, "");
  }
  function navigate(to: string) {
    window.history.pushState({}, "", to || "/");
    setRoute(parseRoute());
  }

  return (
    <ErrorBoundary>
      <I18nProvider>
      <FluxProvider>
        <BackendSync />
        <div className="size-full min-h-screen">
          {route.kind === "admin" && <AdminApp onExit={() => navigate(base() || "/")} />}
          {route.kind === "verify" && <VerifyPage id={route.id} onHome={() => navigate(base() || "/")} />}
          {route.kind === "public" && <PublicApp />}
        </div>
        <Toaster position="top-center" richColors closeButton />
      </FluxProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
