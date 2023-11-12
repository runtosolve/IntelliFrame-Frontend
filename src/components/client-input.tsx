import DynamicInputFiled from "./form-input/dynamic-input-field";
import LabelledInputField from "./form-input/input-field";
import LabelledSelectField from "./form-input/select-field";
import { PurLinLineState, PurLinLineStateDispatch, INITIAL_PURLIN_STATE } from "./hooks/use-purlin-line";
import React from "react";
import { v4 as uuidv4 } from 'uuid';
import dynamic from "next/dynamic";
import purlinData from "../data/Purlins.json";
import deckData from "../data/Decks.json";


const PurlineViewNoSSR = dynamic(() => import("./viewer/purlin-view"), {
  ssr: false,
});

export default function ClientInput({state, dispatch}: ClientInputProps) {

  return (
    <div className="w-1/2 space-y-3">
      <div className="aspect-video rounded overflow-hidden mb-8">
        <PurlineViewNoSSR
          purlinData={generatePurlinViewData(state.spans, state.lapLength)}
          frameFlangeWidth={state.frameFlangeWidth}
        />
      </div>
      <LabelledInputField
        label="Roof slope (deg.)"
        name="roofSlope"
        defaultValue={INITIAL_PURLIN_STATE.roofSlope.toFixed(2)}
        setField={(v) => dispatch({
          type: "set",
          field: "roofSlope",
          payload: v
        })}
      />
      <LabelledSelectField
        label="Deck type"
        name="deckType"
        value={state.deckType}
        onChange={(e) => dispatch({
          type: "set",
          field: "deckType",
          payload: e.target.value
        })}
      >
        {DECK_OPTIONS.map(item => 
          <option value={item.value} key={uuidv4()}>
            {item.label}
          </option>  
        )}
      </LabelledSelectField>
      <LabelledSelectField
        label="Cross section"
        name="crossSection"
        value={state.crossSection}
        onChange={(e) => dispatch({
          type: "set",
          field: "crossSection",
          payload: e.target.value
        })}
      >
        {CROSS_SECTION_OPTIONS.map(item => 
          <option value={item.value} key={uuidv4()}>
            {item.label}
          </option>  
        )}
      </LabelledSelectField>
      <DynamicInputFiled
        label="Spans (ft.)"
        name="spans"
        value={state.spans}
        setField={(v) => dispatch({
          type: "set",
          field: "spans",
          payload: v
        })}
      />
      <LabelledInputField
        label="Lap length (in.)"
        name="lapLength"
        defaultValue={INITIAL_PURLIN_STATE.lapLength.toFixed(2)}
        minValue={2.5}
        setField={(v) => dispatch({
          type: "set",
          field: "lapLength",
          payload: v,
        })}
      />
      <LabelledInputField
        label="Spacing (ft.)"
        name="spacing"
        defaultValue={INITIAL_PURLIN_STATE.spacing.toFixed(2)}
        setField={(v) => dispatch({
          type: "set",
          field: "spacing",
          payload: v,
        })}
      />
      <LabelledInputField
        label="Frame flange width (in.)"
        name="frameFlangeWidth"
        defaultValue={INITIAL_PURLIN_STATE.frameFlangeWidth.toFixed(2)}
        minValue={0.5}
        setField={(v) => dispatch({
          type: "set",
          field: "frameFlangeWidth",
          payload: v,
        })}
      />
    </div>
  );
}

type ClientInputProps = {
  state: PurLinLineState,
  dispatch: PurLinLineStateDispatch,
}


const CROSS_SECTION_OPTIONS = purlinData.map(item => {
  return {label: item.name, value: item.name}
});

const DECK_OPTIONS = deckData.map(item => {
  return {label: item.name, value: item.name}
});

// const CROSS_SECTION_OPTIONS = [
//   {label: "Z8x2.5 060", value: "Z8x2.5 060"},
//   {label: "Z8x2.5 080", value: "Z8x2.5 080"}
// ]

// const DECK_OPTIONS = [
//   {label: "SSR Ultra-Dek 18 in. 24 ga", value: "SSR Ultra-Dek 18 in. 24 ga"},
//   {label: "SSR Ultra-Dek 20 in. 24 ga", value: "SSR Ultra-Dek 20 in. 24 ga"}
// ]

/**
 * Convert state's raw span data into format consumable for PurLinView componet
 * @param spans 
 * @param lapLength unit: inches
 */
export function generatePurlinViewData(spans: Array<{id: string, value: number}>, lapLength: number) {

  const data = spans.map((item, index) => {
    let leftLap = (index == 0) ? (0) : (lapLength / 12);
    let rightLap = (index == (spans.length - 1)) ? (0) : (lapLength / 12)
    
    return {id: item.id, index, leftLap, span: item.value, rightLap}
  })

  return data

}
