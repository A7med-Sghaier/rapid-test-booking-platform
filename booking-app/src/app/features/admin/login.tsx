import { useState } from "react";
import { Activity, Lock, ShieldCheck, Users } from "lucide-react";
import { Logo } from "../../shared";
import { login as loginAgent, storeAuthToken } from "../../lib/api";

/** Staff sign-in split screen shown until an agent token is present. */
export function AdminLogin({ onLogin, onExit }: { onLogin: () => void; onExit: () => void }) {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setFailure(null);
    try {
      const auth = await loginAgent(userName, password);
      if (auth.access_token) {
        storeAuthToken(auth);
        onLogin();
        return;
      }
      setFailure(auth.error ?? "Login failed");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[color:var(--sidebar)] p-12 text-white lg:flex">
        <Logo dark />
        <div>
          <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight">
            Operations console for your test center.
          </h2>
          <p className="mt-3 max-w-sm text-slate-400">
            Check-ins, results, certificates and health-office reporting — one fast, secure workspace for your agents.
          </p>
          <div className="mt-8 flex gap-6 text-sm text-slate-300">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[color:var(--success)]" /> GDPR secured</span>
            <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-[color:var(--success)]" /> Live sync</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">Rapid Test Platform</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your agent credentials to continue.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Username</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <input value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>
            {failure && <div className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-[color:var(--danger)]">{failure}</div>}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" defaultChecked /> Remember me
              </label>
              <button type="button" className="font-medium text-primary hover:underline">Need help?</button>
            </div>
            <button
              disabled={loading || !userName.trim() || !password}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
              Sign in
            </button>
          </form>

          <button onClick={onExit} className="mt-6 text-sm text-muted-foreground hover:text-foreground">
            ← Back to public site
          </button>
        </div>
      </div>
    </div>
  );
}
