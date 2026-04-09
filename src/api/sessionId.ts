const STORAGE_KEY = "raffle-session-id";

/**
 * Stable id for this browser tab session (per Raffle search / insights grouping).
 * Stored in sessionStorage so it survives refreshes but not new tabs.
 */
export function getOrCreateSessionId(): string {
  if (typeof sessionStorage === "undefined") {
    return crypto.randomUUID();
  }
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
