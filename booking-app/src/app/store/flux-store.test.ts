import { describe, expect, it } from "vitest";
import { EMPTY_STATE, reducer, type AppState } from "./flux-store";

function base(over: Partial<AppState> = {}): AppState {
  return { ...EMPTY_STATE, ...over };
}

describe("flux reducer", () => {
  it("HYDRATE replaces only provided slices", () => {
    const s = base({ role: "Admin" });
    const next = reducer(s, { type: "HYDRATE", payload: { patients: [{ id: "x" } as never] } });
    expect(next.patients).toHaveLength(1);
    expect(next.role).toBe("Admin"); // untouched
  });

  it("SET_ROLE updates only the selected admin role", () => {
    const s = base({ agents: [{ id: "agent-1" } as never] });
    const next = reducer(s, { type: "SET_ROLE", role: "Agent" });
    expect(next.role).toBe("Agent");
    expect(next.agents).toBe(s.agents);
  });
});
