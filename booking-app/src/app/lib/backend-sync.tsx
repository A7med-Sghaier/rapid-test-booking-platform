import { useEffect } from "react";
import { loadRealAppState } from "./api";
import { useFlux } from "../store/flux-store";

export const BACKEND_REFRESH_EVENT = "rapid-test:refresh-backend-data";

export function requestBackendRefresh() {
  window.dispatchEvent(new Event(BACKEND_REFRESH_EVENT));
}

export function BackendSync() {
  const { dispatch } = useFlux();

  useEffect(() => {
    let active = true;

    async function refresh() {
      const payload = await loadRealAppState();
      if (active) dispatch({ type: "HYDRATE", payload });
    }

    const onRefresh = () => void refresh();
    void refresh();
    window.addEventListener(BACKEND_REFRESH_EVENT, onRefresh);
    return () => {
      active = false;
      window.removeEventListener(BACKEND_REFRESH_EVENT, onRefresh);
    };
  }, [dispatch]);

  return null;
}
