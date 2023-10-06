import {Dispatch, useReducer} from "react";

export default function usePurlinLine(): [PurLinLineState, Dispatch<ReducerAction>] {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  return [state, dispatch]
}

function reducer(state: PurLinLineState, action: ReducerAction): PurLinLineState {
  switch (action.type) {
    case "set":
      return { ...state, [action.field]: action.payload }
    default:
      return state;
  }
}

export const INITIAL_STATE: PurLinLineState = {
  roofSlope: 1 / 12,
  deckType: "SSR Ultra-Dek 18 in. 24 ga",
  crossSection: "Z8x2.5 060",
  span: [16],
  lapLength: 4,
  spacing: 5, 
  frameFlangeWidth: 6, 
}

// Use only the following props for now:
// span length, lap length, and cross-section type
type PurLinLineState = {
  roofSlope: number, // unit: degrees
  deckType: string, 
  crossSection: string, 
  span: [number], // unit: ft
  lapLength: number, // unit: ft
  spacing: number, // unit: ft
  frameFlangeWidth: number, // unit: in.
}

type ReducerAction = 
  | { type: "set", field: "roofSlope" | "lapLength" | "spacing" | "frameFlangeWidth", payload: number }
  | { type: "set", field: "deckType" | "crossSection", payload: string }





