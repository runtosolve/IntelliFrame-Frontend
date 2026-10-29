import {Dispatch, useReducer} from "react";
import { v4 as uuidv4 } from 'uuid';

export default function usePurlinLine(): [PurLinLineState, PurLinLineStateDispatch] {
  const [state, dispatch] = useReducer(reducer, INITIAL_PURLIN_STATE)

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

export const INITIAL_PURLIN_STATE: PurLinLineState = {
  loadDirection: "gravity",
  roofSlope: 1 / 12,
  deckType: "SSR Trapezoidal 18 in. 24 g",
  crossSection: "Z8x2.5 054",
  intelliFrameSection: "2x4.5x2.5 16g",
  spans: [
    {id: uuidv4(), value: 16},
    {id: uuidv4(), value: 20},
  ],
  lapNegZ: 2,
  lapPosZ: 2,
  spacing: 5, 
  frameFlangeWidth: 6, 
}

export type PurLinLineState = {
  loadDirection: "gravity" | "uplift",
  roofSlope: number,
  deckType: string, 
  crossSection: string,
  intelliFrameSection: string,
  spans: Array<{id: string, value: number}>,
  lapNegZ: number,
  lapPosZ: number,
  spacing: number,
  frameFlangeWidth: number,
}

export type PurLinLineStateDispatch = Dispatch<ReducerAction>

type ReducerAction = 
  | { type: "set", field: "roofSlope" | "lapNegZ" | "lapPosZ" | "spacing" | "frameFlangeWidth", payload: number }
  | { type: "set", field: "deckType" | "crossSection" | "intelliFrameSection", payload: string }
  | { type: "set", field: "loadDirection", payload: "gravity" | "uplift" }
  | { type: "set", field: "spans", payload: Array<{id: string, value: number}>}





