import {useReducer} from "react";

function usePurlin() {

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

}

function reducer(state: PurLinState, action: PurlinAction): PurLinState {
  switch (action.type) {
    case "set":
      return { ...state, [action.field]: action.payload }
    default:
      return state;
  }
}

const INITIAL_STATE = {
  span: 16 * 12,
  slope: 0,
  lapLength: 4,
  crossSection: "Z",
}

// Use only the following props for now:
// span length, lap length, and cross-section type
type PurLinState = {
  span: number, // unit: inches
  slope: number, // unit: degrees
  lapLength: number, // unit: inches
  crossSection: string, // use default section represented as string for now
}

type PurlinAction = {
  type: "set" | "add",
  field: string,
  payload: number,
}







