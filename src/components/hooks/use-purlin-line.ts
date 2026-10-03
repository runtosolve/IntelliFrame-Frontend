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
  deckType: "SSR Ultra-Dek 18 in. 24 ga",
  crossSection: "Z8x2.5 060",
  spans: [
    {id: uuidv4(), value: 16},
    {id: uuidv4(), value: 20},
  ],
  lapLength: 4,
  spacing: 5, 
  frameFlangeWidth: 6, 
}

export type PurLinLineState = {
  loadDirection: string,
  roofSlope: number,
  deckType: string, 
  crossSection: string, 
  spans: Array<{id: string, value: number}>,
  lapLength: number,
  spacing: number,
  frameFlangeWidth: number,
}

export type PurLinLineStateDispatch = Dispatch<ReducerAction>

type ReducerAction = 
  | { type: "set", field: "roofSlope" | "lapLength" | "spacing" | "frameFlangeWidth", payload: number }
  | { type: "set", field: "deckType" | "crossSection" | "loadDirection", payload: string }
  | { type: "set", field: "spans", payload: Array<{id: string, value: number}>}





