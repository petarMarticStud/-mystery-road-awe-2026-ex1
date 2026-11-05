export interface EvidenceFilters {
  search: string;
  type: string;
  person: string;
  location: string;
  status: string;
  relevance: string;
  sort: string;
}

export const initialFilters: EvidenceFilters = {
  search: "",
  type: "",
  person: "",
  location: "",
  status: "",
  relevance: "",
  sort: "original",
};

export type FilterAction =
  | {
      type: "SET_FILTER";
      field: Exclude<keyof EvidenceFilters, "sort">;
      value: string;
    }
  | { type: "SET_SORT"; value: string }
  | { type: "CLEAR_FILTERS" };

export function filterReducer(
  state: EvidenceFilters,
  action: FilterAction,
): EvidenceFilters {
  switch (action.type) {
    case "SET_FILTER":
      return { ...state, [action.field]: action.value };
    case "SET_SORT":
      return { ...state, sort: action.value };
    case "CLEAR_FILTERS":
      return { ...initialFilters };
  }
}
