export function loadNotes(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem("remotion_notes") ?? "{}",
    );
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === "string"),
    );
  } catch {
    return {};
  }
}
