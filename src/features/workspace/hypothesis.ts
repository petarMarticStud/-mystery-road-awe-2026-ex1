export interface Hypothesis {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  confidence: number;
  explanation: string;
  alternative: string;
}

export function loadHypothesis(): Hypothesis {
  const empty: Hypothesis = {
    suspectId: "",
    nature: "",
    evidenceIds: [],
    confidence: 50,
    explanation: "",
    alternative: "",
  };

  try {
    const draft = JSON.parse(
      localStorage.getItem("remotion_hypothesis") ?? "null",
    );
    if (!draft || typeof draft !== "object" || Array.isArray(draft))
      return empty;
    // The vanilla version stored confidence as a string.
    const confidence = Number(draft.confidence ?? 50);
    return {
      suspectId: typeof draft.suspectId === "string" ? draft.suspectId : "",
      nature: ["accidental", "deliberate", "unclear"].includes(draft.nature)
        ? draft.nature
        : "",
      evidenceIds: Array.isArray(draft.evidenceIds)
        ? draft.evidenceIds.filter(
            (id: unknown): id is string => typeof id === "string",
          )
        : [],
      confidence: Number.isFinite(confidence)
        ? Math.min(100, Math.max(0, confidence))
        : 50,
      explanation:
        typeof draft.explanation === "string" ? draft.explanation : "",
      alternative:
        typeof draft.alternative === "string" ? draft.alternative : "",
    };
  } catch {
    return empty;
  }
}
